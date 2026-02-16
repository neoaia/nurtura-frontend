// Shared base for items in harvest and planting
export interface BasePlantItemDTO {
  plantName: string;
  rackName: string;
  time: string;
}

export interface PlantedItemDTO {
  plantName: string;
  rackName: string;
  time: string;
  quantity: string;
}

// For Havrest Summary Cards
export interface HarvestSummaryDTO {
  value: string | number;
  unit: string;
  label: string;
}

// For Activity Items (Water/Light)
export interface ActivityDTO {
  type: "water" | "light";
  plantName: string;
  rackName: string;
  time: string; // time of the activity
  amount?: number; // for water amount
  duration?: string; // for light duration
}
