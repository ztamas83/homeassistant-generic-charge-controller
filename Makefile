# Generic Charge Controller - Makefile
#
# Usage:
#   make build             - Build the frontend
#   make deploy            - Deploy to Home Assistant via SSH
#   make restart-ha        - Check the configuration and restart Home Assistant Core via SSH
#   make release VERSION=x.y.z - Bump the manifest version, commit, tag and push
#   make clean             - Remove temporary files
#
# Configuration (loaded from .env if present):
#   HA_IP                  - Home Assistant IP/hostname
#   SSH_PORT               - SSH port (default: 22)
#   SSH_USER               - SSH user (default: root)
#   REMOTE_CONFIG          - Remote HA config path (default: /config)
#   SSH_KEY                - Path to SSH private key

-include .env

# Defaults
HA_IP         ?= localhost
SSH_PORT      ?= 22
SSH_USER      ?= root
REMOTE_CONFIG ?= /config
COMPONENT_NAME = generic_charge_controller
MANIFEST       = custom_components/$(COMPONENT_NAME)/manifest.json

# SSH options
SSH_OPTS = -p $(SSH_PORT) -o StrictHostKeyChecking=no
ifdef SSH_KEY
    SSH_OPTS += -i $(SSH_KEY)
endif
SSH_CMD = ssh $(SSH_OPTS)

.PHONY: all build deploy restart-ha release clean test help

all: help

help:
	@echo "Available targets:"
	@echo "  build             - Build the frontend (requires npm)"
	@echo "  deploy            - Deploy to Home Assistant via SSH"
	@echo "  restart-ha        - Check the configuration and restart Home Assistant Core via SSH"
	@echo "  release           - Release VERSION=x.y.z (or x.y.z-beta.N): bump manifest, commit, tag, push"
	@echo "  clean             - Remove temporary files (local __pycache__)"
	@echo "  test              - Run tests with pytest"
	@echo "  help              - Show this help message"

build:
	@echo "==> Building Frontend"
	cd frontend && npm ci && npm run build
	@echo "    OK"

deploy: build
	@echo "==> Deploying to $(SSH_USER)@$(HA_IP):$(SSH_PORT)"
	@# Extract into a temporary folder and swap it in only after a complete transfer,
	@# so files removed locally are also removed on Home Assistant
	@export COPYFILE_DISABLE=1; \
	tar czf - --exclude=__pycache__ -C "custom_components/$(COMPONENT_NAME)" . | \
		$(SSH_CMD) "$(SSH_USER)@$(HA_IP)" \
		"set -e; dir=$(REMOTE_CONFIG)/custom_components/$(COMPONENT_NAME); \
		 sudo rm -rf \$$dir.new; sudo mkdir -p \$$dir.new; \
		 sudo tar xzf - -C \$$dir.new; \
		 sudo rm -rf \$$dir; sudo mv \$$dir.new \$$dir"
	@echo "    OK"
	@echo ""
	@echo "==> Done! Next steps:"
	@echo "    - Restart Home Assistant to load the new version: make restart-ha"

restart-ha:
	@echo "==> Checking configuration on $(SSH_USER)@$(HA_IP):$(SSH_PORT)"
	@$(SSH_CMD) "$(SSH_USER)@$(HA_IP)" "ha core check"
	@echo "==> Restarting Home Assistant Core"
	@$(SSH_CMD) "$(SSH_USER)@$(HA_IP)" "ha core restart"
	@echo "    OK"

release:
	@echo "$(VERSION)" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.]+)?$$' || \
		{ echo "Usage: make release VERSION=x.y.z (or x.y.z-beta.N)"; exit 1; }
	@test "$$(git branch --show-current)" = master || { echo "Not on master"; exit 1; }
	@git diff --quiet HEAD || { echo "Working tree has uncommitted changes"; exit 1; }
	@! git rev-parse -q --verify "refs/tags/v$(VERSION)" >/dev/null || { echo "Tag v$(VERSION) already exists"; exit 1; }
	@echo "==> Releasing v$(VERSION)"
	jq --indent 2 '.version = "$(VERSION)"' $(MANIFEST) > $(MANIFEST).tmp && mv $(MANIFEST).tmp $(MANIFEST)
	git commit -m "Release v$(VERSION)" $(MANIFEST)
	git tag -a "v$(VERSION)" -m "v$(VERSION)"
	git push --atomic origin master "v$(VERSION)"
	@echo "    OK, the release workflow publishes the GitHub release"

clean:
	@echo "==> Cleaning local __pycache__ files"
	find . -type d -name "__pycache__" -exec rm -rf {} +
	@echo "    OK"

test:
	@echo "==> Running tests"
	@if [ -f .venv/bin/pytest ]; then .venv/bin/pytest tests/; else pytest tests/; fi
