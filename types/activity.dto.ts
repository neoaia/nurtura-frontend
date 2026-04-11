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
  date: Date;
}

// For Harvest Summary Cards
export interface HarvestSummaryDTO {
  value: string | number;
  unit: string;
  label: string;
}

// For Activity Items (Water/Light)
export interface ActivityDTO {
  id: string;
  type: "water" | "light";
  eventType: "WATERING_START" | "WATERING_STOP" | "LIGHT_ON" | "LIGHT_OFF";
  plantName: string;
  rackName: string;
  time: string;
  amount?: number;
  duration?: string;
  date: Date;
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

// ─── Rack Activity ────────────────────────────────────────────────────────────

export type RackEventType = "RACK_ADDED" | "RACK_REMOVED" | "RACK_RENAMED";

export interface RackActivityDTO {
  id: string;
  rackId: string;
  eventType: RackEventType;
  details: string;
  metadata: Record<string, unknown>;
  timestamp: string; // ISO 8601
  rack: {
    id: string;
    name: string;
    macAddress: string;
  };
}

export interface RackActivityMetaDTO {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetRackActivitiesRequestDTO {
  page?: number;
  limit?: number;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  rackId?: string;
}

export interface GetRackActivitiesResponseDTO {
  data: RackActivityDTO[];
  meta: RackActivityMetaDTO;
  amount: number;
}
