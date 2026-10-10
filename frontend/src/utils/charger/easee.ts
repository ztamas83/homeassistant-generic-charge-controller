import { DiscoveredCharger, HomeAssistant } from "../../types";
import { ChargerData } from "./charger-data";

const num = (value: unknown): number => {
  const parsed = parseFloat(value as string);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Combine an Easee charger found by the backend with its live entity states.
 */
export const getEaseeChargerData = (
  hass: HomeAssistant,
  charger: DiscoveredCharger
): ChargerData => {
  const state = (key: keyof DiscoveredCharger["entities"]) => {
    const entityId = charger.entities[key];
    return entityId ? hass.states[entityId] : undefined;
  };

  const circuitCurrent = state("circuit_current");
  const attr = (phase: number) =>
    num(circuitCurrent?.attributes[`state_circuitTotalPhaseConductorCurrentL${phase}`]);
  const [l1, l2, l3] = [attr(1), attr(2), attr(3)];

  return {
    id: charger.device_id,
    name: charger.name,
    serialNumber: charger.serial,
    status: state("status")?.state ?? "unknown",
    power: num(state("power")?.state),
    currentLimit: num(state("max_circuit_limit")?.state),
    currentUsage: Math.max(l1, l2, l3),
    l1_usage: l1,
    l2_usage: l2,
    l3_usage: l3,
  };
};
