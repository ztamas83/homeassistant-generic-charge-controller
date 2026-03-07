import { HassEntity, HomeAssistant } from "../../types";

export interface ChargerData {
  id: string;
  name: string;
  serialNumber: string;
  status: string;
  power: number;
  currentLimit: number;
  currentUsage: number;
  configured: boolean;
}

/**
 * Get chargers from the 'easee' domain by looking at devices and their entities.
 */
export const getEaseeChargers = (hass: HomeAssistant): ChargerData[] => {
  // 1. Find all entities with platform "easee"
  const easeeEntities = Object.values(hass.entities).filter(
    (e) => e.platform === "easee"
  );

  // 2. Find unique device IDs for these entities
  const deviceIds = new Set<string>();
  for (const entity of easeeEntities) {
    if (entity.device_id) {
      deviceIds.add(entity.device_id);
    }
  }

  const chargers: ChargerData[] = [];

  // 3. For each device ID, gather information
  for (const deviceId of deviceIds) {
    const device = hass.devices[deviceId];
    if (!device) continue;

    // Find all entities for this device
    const deviceEntities = Object.values(hass.entities).filter(
      (e) => e.device_id === deviceId
    );

    // Create a map of entity_id to state for easy lookup
    const stateMap = deviceEntities.reduce((map, e) => {
      const state = hass.states[e.entity_id];
      if (state) {
        map.set(e.entity_id, state);
      }
      return map;
    }, new Map<string, HassEntity>());

    console.log(`State map for device ${deviceId}: `, stateMap);

    const getSensorEntityId = (suffix: string) => {
      return `sensor.${device.name?.toLowerCase().replace(/\s+/g, "_")}_${suffix}`;
    }

    // Find status and power sensors
    const status = stateMap.get(getSensorEntityId("status"))?.state || "Unknown";
    const power = parseFloat(stateMap.get(getSensorEntityId("power"))?.state || "0");
    const currentLimit = parseFloat(stateMap.get(getSensorEntityId("max_circuit_limit"))?.state || "0");

    chargers.push({
      id: deviceId,
      name: device.name || "Unknown Charger",
      serialNumber: device.serial_number || "N/A",
      status: status,
      power: power,
      currentLimit: currentLimit,
      currentUsage: (power * 1000) / 230, // Simplified conversion for display
      configured: false, // To be implemented later (check store)
    });

  }

  return chargers;
};
