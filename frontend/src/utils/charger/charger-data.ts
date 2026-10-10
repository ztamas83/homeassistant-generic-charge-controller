/** Live charger values shown in the panel. */
export interface ChargerData {
  id: string;
  name: string;
  serialNumber: string;
  status: string;
  power: number;
  currentLimit: number;
  currentUsage: number;
  l1_usage: number;
  l2_usage: number;
  l3_usage: number;
}
