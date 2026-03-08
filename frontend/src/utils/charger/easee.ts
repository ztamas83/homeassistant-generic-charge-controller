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
  l1_usage: number;
  l2_usage: number;
  l3_usage: number;
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

    const getSensorEntityId = (suffix: string) => {
      return `sensor.${device.name?.toLowerCase().replace(/\s+/g, "_")}_${suffix}`;
    }

    // Find status, power, and circuit current sensors
    const status = stateMap.get(getSensorEntityId("status"))?.state || "Unknown";
    const power = parseFloat(stateMap.get(getSensorEntityId("power"))?.state || "0");
    const currentLimit = parseFloat(stateMap.get(getSensorEntityId("max_circuit_limit"))?.state || "0");
    
    const circuitCurrentEntity = stateMap.get(getSensorEntityId("circuit_current"));
    let l1 = 0, l2 = 0, l3 = 0;
    
    if (circuitCurrentEntity) {
      l1 = parseFloat(circuitCurrentEntity.attributes.state_circuitTotalPhaseConductorCurrentL1 as any) || 0;
      l2 = parseFloat(circuitCurrentEntity.attributes.state_circuitTotalPhaseConductorCurrentL2 as any) || 0;
      l3 = parseFloat(circuitCurrentEntity.attributes.state_circuitTotalPhaseConductorCurrentL3 as any) || 0;
    }

    chargers.push({
      id: deviceId,
      name: device.name || "Unknown Charger",
      serialNumber: device.serial_number || "N/A",
      status: status,
      power: power,
      currentLimit: currentLimit,
      currentUsage: Math.max(l1, l2, l3), // Total usage as max of phases
      l1_usage: l1,
      l2_usage: l2,
      l3_usage: l3,
      configured: false, // To be implemented later (check store)
    });

  }

  return chargers;
};
