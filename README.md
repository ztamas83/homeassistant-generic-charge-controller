# Generic Charge Controller for Home Assistant

This project is for controlling EV charger limits in order to protect the main fuses. This integration runs fully locally and can in theory control any type of charger. The goal is to receive data from any type of utility meter reader.

## Installation

### HACS [![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)
1. In HACS Store, search for [***ztamas83/homeassistant-generic-charge-controller***]
1. Install the custom integration
1. Setup the generic charge controller custom integration as described above

### Manual
1. Clone this repo
1. Copy the `custom_components/generic_charge_controller` folder into your HA's `custom_components` folder
1. Setup the generic charge controller custom integration as described above

## Development

A `Makefile` is provided to simplify common development tasks.

### Prerequisites
1. Copy `.env.example` to `.env` (if available) or create a `.env` file with your Home Assistant SSH details:
   ```env
   HA_IP=192.168.1.100
   SSH_USER=root
   ```
2. Ensure you have SSH access to your Home Assistant instance.

### Common Commands
- `make help`: Show all available commands.
- `make build`: Run the build step (currently a placeholder).
- `make deploy`: Build and deploy the integration to your Home Assistant instance via SSH.
- `make clean`: Remove local `__pycache__` files.
- `make test`: Run tests (requires `pytest`).
