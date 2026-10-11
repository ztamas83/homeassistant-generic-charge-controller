/**
 * Type definitions for the Charge Controller panel.
 */

// HA types for panel integration
export interface HomeAssistant {
  callWS: <T>(msg: Record<string, unknown>) => Promise<T>;
  callService: (
    domain: string,
    service: string,
    data?: Record<string, unknown>
  ) => Promise<void>;
  states: Record<string, HassEntity>;
  entities: Record<string, HassEntityRegistryEntry>;
  devices: Record<string, HassDeviceRegistryEntry>;
  language: string;
}

export interface HassEntityRegistryEntry {
  entity_id: string;
  area_id: string | null;
  device_id: string | null;
  platform: string;
}

export interface HassDeviceRegistryEntry {
  id: string;
  area_id: string | null;
  name: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

// Charge controller configuration, as stored by the backend
export type HouseholdPhase = "L1" | "L2" | "L3";
export type ChargerPhase = "P1" | "P2" | "P3";

export interface HouseholdConfig {
  household_id: string;
  name: string;
  fuse_a: number;
  l1_entity: string;
  l2_entity: string;
  l3_entity: string;
}

export interface ChargerConfig {
  charger_id: string;
  type: "easee";
  household_id: string;
  phase_map: Record<HouseholdPhase, ChargerPhase>;
}

// Charger found in HA by the backend (generic_charge_controller/chargers/discover)
export interface DiscoveredCharger {
  device_id: string;
  name: string;
  serial: string;
  model: string | null;
  entities: Partial<Record<"status" | "power" | "circuit_current" | "max_circuit_limit", string>>;
  /** Entities that exist but are disabled in HA. */
  disabled_entities: string[];
}

// Entity ids of the integration's sensors (generic_charge_controller/entities)
export type ChargerEntityKey =
  | "target_current_P1"
  | "target_current_P2"
  | "target_current_P3"
  | "charger_current_P1"
  | "charger_current_P2"
  | "charger_current_P3"
  | "mode"
  | "control_switch";

export interface ControllerEntities {
  households: Record<string, Partial<Record<HouseholdPhase, string>>>;
  chargers: Record<string, Partial<Record<ChargerEntityKey, string>>>;
}

export interface ControllerSettings {
  charger_update_interval_s: number;
  safety_margin_a: number;
  ramp_up_a_per_min: number;
  stale_after_s: number;
}
