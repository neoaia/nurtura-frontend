export interface GetRackInfoDTO {
  name: string;
  plant: string;
  image?: string;
  leaves: number;
  water: number;
  humidity: number;
  temperature: number;
  hasAlert?: boolean;
  onPress?: () => void;
  onMorePress?: () => void;
}
