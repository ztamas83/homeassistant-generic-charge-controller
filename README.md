
# Generic Charge Controller for Home Assistant

Due to the fact that humidity levels are different during the summer and winter, a static humidity level switching the fan is on/off is not possible. This binary_sensor detects high rises in humidity and switches on. And switches off when the humidity is back to normal.


## Setup
Follow the config flow

## Installation
### HACS [![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)
1. In HACS Store, search for [***ztamas83/homeassistant-generic-charge-controller***]
1. Install the custom integration
1. Setup the generic charge controller custom integration as described above

### Manual
1. Clone this repo
1. Copy the `custom_components/generic_charge_controller` folder into your HA's `custom_components` folder
1. Setup the generic charge controller custom integration as described above
