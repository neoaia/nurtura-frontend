import { useCallback, useEffect, useState } from "react";
import { plantService } from "../services/plantService";
import {
  AddRackRequestDTO,
  AddRackResponseDTO,
  DashboardResponseDTO,
  NotificationsResponseDTO,
} from "../types/home.dto";
import useFetch from "./useFetch";

const mockApiResponse: DashboardResponseDTO = {
  user: {
    name: "User",
    hasNotifications: true,
  },
  summary: [
    { id: "racks", type: "racks", value: null },
    { id: "plants", type: "plants", value: null },
  ],
  highlight: {
    title: "Farm Efficiently",
    description: "Start growing your plant with Nurtura Racks",
    buttonText: "Add Rack",
  },
  recentActivity: [],
};

export const useHome = () => {
  const [data, setData] = useState<DashboardResponseDTO>(mockApiResponse);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { refetch: fetchRacks } = useFetch("/racks", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: fetchPlants } = useFetch("/plants", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: addRackRequest } = useFetch("/racks", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  // Fetches the most recent plant-care activities across all racks
  const { refetch: getPlantCare } = useFetch("/racks/activities/plant-care", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [racksResult, plantsResult, careResponse] = await Promise.all([
        fetchRacks(),
        fetchPlants(),
        plantService.getPlantCareActivities(getPlantCare, {
          page: 1,
          limit: 50, // fetch enough to find 3 completed (_OFF) events
        }),
      ]);

      console.log("Racks result:", racksResult);
      console.log("Plants result:", plantsResult);
      console.log("Plant care result:", careResponse);

      // ── Summary counts ──────────────────────────────────────────────────
      const racksCount =
        racksResult?.data?.data?.filter((rack: any) => rack.isActive === true)
          .length ?? 0;
      const plantsCount = plantsResult?.data?.meta?.totalItems ?? 0;

      // ── Recent activity (last 3 completed events) ───────────────────────
      const recentActivity = (() => {
        if (!careResponse?.data) return [];

        return (
          careResponse.data
            // Keep only completed (_OFF) events, same logic as plant-care.tsx
            .filter((item: any) => item.eventType?.endsWith("_OFF"))
            // Most recent first
            .sort(
              (a: any, b: any) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
            )
            // Take the top 3
            .slice(0, 3)
            .map((item: any) => {
              const isWater = item.eventType.includes("WATERING");
              const dateObj = new Date(item.timestamp);

              const durationMs = item.metadata?.duration;
              const duration = durationMs
                ? `${Math.round(durationMs / 60000)} mins`
                : undefined;

              return {
                id: item.id,
                type: isWater ? "water" : "light",
                action: isWater ? "Watered the" : "Gave light to",
                plant: item.metadata?.ruleName || "Plants",
                timestamp: dateObj.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                duration,
              };
            })
        );
      })();

      setData((prev) => ({
        ...prev,
        summary: [
          {
            id: "racks",
            type: "racks",
            value: racksCount,
            isActive: !!racksResult?.data?.data,
          },
          {
            id: "plants",
            type: "plants",
            value: plantsCount,
            isActive: !!plantsResult?.data?.data,
          },
        ],
        recentActivity,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchRacks, fetchPlants, getPlantCare]);

  const addRack = async (
    rackData: AddRackRequestDTO,
  ): Promise<AddRackResponseDTO> => {
    try {
      const { data, error } = await addRackRequest({ body: rackData });

      if (error || !data) {
        return {
          success: false,
          message: error?.message || "Failed to add rack",
        };
      }

      await fetchDashboard(); // refresh counts + recent activity
      return { success: true, message: "Rack added successfully" };
    } catch (err) {
      console.error("Error adding rack:", err);
      throw err;
    }
  };

  const getNotifications = async (): Promise<NotificationsResponseDTO> => {
    try {
      return { notifications: [], unreadCount: 0 };
    } catch (err) {
      console.error("Error fetching notifications:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
    addRack,
    getNotifications,
  };
};
