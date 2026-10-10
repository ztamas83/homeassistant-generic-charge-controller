
export interface ChargerData {
  id: string;
  name: string;
  serialNumber: string;
  status: string;
  power: number;
  currentLimit: number;
  currentUsage: number;
  configured: boolean;
  l1_ref: string;
  l2_ref: string;
  l3_ref: string;
  l1_usage: number;
  l2_usage: number;
  l3_usage: number;
}
