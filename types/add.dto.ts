export interface PlantItemDTO {
  plantName: string;
  category: string;
  soilType: string;
  quantity: number;
  image?: string;
  onPress: () => void | Promise<void>;
  isSelected?: boolean;
}
