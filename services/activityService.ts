import {
    GetRackActivitiesRequestDTO,
    GetRackActivitiesResponseDTO,
} from "@/types/activity.dto";
import { handleRequest } from "@/utils/request";

export const activityService = {
  async getRackActivities(
    refetch: any,
    params?: GetRackActivitiesRequestDTO,
  ): Promise<GetRackActivitiesResponseDTO> {
    return handleRequest<GetRackActivitiesResponseDTO>(
      "Fetching rack management activities",
      () => refetch({ params }),
    );
  },
};
