// Shared base for items in harvest and planting
export interface BasePlantItemDTO {
  id: string;
  plantName: string;
  rackName: string;
  time: string;
  date: Date;
}

export interface PlantedItemDTO {
  id: string;
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
  id: string;
  type: "water" | "light";
  plantName: string;
  rackName: string;
  time: string; 
  amount?: number;
  duration?: string;
}

// For Charts
export interface ChartDataPoint {
  timestamp: number; 
  value: number;     
}

export interface PlantChartDTO {
  title: string;
  data: ChartDataPoint[];
  yLabels: string[];
  tooltipLabel: string;
  chartWidth?: number; 
  chartColor?: string;
}
