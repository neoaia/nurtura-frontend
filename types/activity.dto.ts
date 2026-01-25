import { ImageSourcePropType } from "react-native";

// Shared base for items in harvest and planting
export interface BasePlantItemDTO {
  plantName: string;
  rackName: string;
  time: string;
  weight: string;
  plantImage?: ImageSourcePropType;
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
  location: string;
  time: string;
  duration: string;
}