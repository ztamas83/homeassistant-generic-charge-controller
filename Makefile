# Generic Charge Controller - Makefile
#
# Usage:
#   make build             - Build the frontend
#   make deploy            - Deploy to Home Assistant via SSH
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

# SSH options
SSH_OPTS = -p $(SSH_PORT) -o StrictHostKeyChecking=no
ifdef SSH_KEY
    SSH_OPTS += -i $(SSH_KEY)
endif
SSH_CMD = ssh $(SSH_OPTS)

.PHONY: all build deploy clean test help

all: help

help:
	@echo "Available targets:"
	@echo "  build             - Build the frontend (requires npm)"
	@echo "  deploy            - Deploy to Home Assistant via SSH"
	@echo "  clean             - Remove temporary files (local __pycache__)"
	@echo "  test              - Run tests with pytest"
	@echo "  help              - Show this help message"

build:
	@echo "==> Building Frontend"
	cd frontend && npm install && npm run build
	@echo "    OK"

deploy: build
	@echo "==> Deploying to $(SSH_USER)@$(HA_IP):$(SSH_PORT)"
	@export COPYFILE_DISABLE=1; \
	$(SSH_CMD) "$(SSH_USER)@$(HA_IP)" \
		"sudo mkdir -p $(REMOTE_CONFIG)/custom_components/$(COMPONENT_NAME) && \
		 sudo find $(REMOTE_CONFIG)/custom_components/$(COMPONENT_NAME) -name '__pycache__' -exec rm -rf {} + 2>/dev/null; true"
	@tar czf - -C "custom_components/$(COMPONENT_NAME)" . | \
		$(SSH_CMD) "$(SSH_USER)@$(HA_IP)" "sudo tar xzf - -C $(REMOTE_CONFIG)/custom_components/$(COMPONENT_NAME)/"
	@echo "    OK"
	@echo ""
	@echo "==> Done! Next steps:"
	@echo "    - Python changes:        Settings -> Integrations -> Charge Controller -> ⋮ -> Reload"
	@echo "    - WS schema / manifest:  Full HA restart (Settings -> System -> Restart)"

clean:
	@echo "==> Cleaning local __pycache__ files"
	find . -type d -name "__pycache__" -exec rm -rf {} +
	@echo "    OK"

test:
	@echo "==> Running tests"
	@if [ -f .venv/bin/pytest ]; then .venv/bin/pytest tests/; else pytest tests/; fi
