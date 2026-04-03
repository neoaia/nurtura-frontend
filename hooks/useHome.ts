import { useCallback, useState } from "react";
import { plantService } from "../services/plantService";
import {
  AddRackRequestDTO,
  AddRackResponseDTO,
  NotificationsResponseDTO
} from "../types/home.dto";
import useFetch from "./useFetch";

const mockApiResponse = {
  user: { name: "User", hasNotifications: true },
  highlight: {
    title: "Farm Efficiently",
    description: "Start growing your plant with Nurtura Racks",
    buttonText: "Add Rack",
  },
};

export const useHome = () => {
  // Pinaghiwalay natin ang data at loading states
  const [user, setUser] = useState(mockApiResponse.user);
  const [highlight, setHighlight] = useState(mockApiResponse.highlight);

  const [summary, setSummary] = useState<any[]>([]);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(true);

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

  const { refetch: getPlantCare } = useFetch("/racks/activities/plant-care", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const fetchDashboard = useCallback(() => {
    setError(null);

    // ── Task 1: Load Summary (Racks & Plants) independently ──
    const loadSummary = async () => {
      setIsSummaryLoading(true);
      try {
        const [racksResult, plantsResult] = await Promise.all([
          fetchRacks().catch((e) => {
            console.error("Failed to fetch racks:", e);
            return null;
          }),
          fetchPlants().catch((e) => {
            console.error("Failed to fetch plants:", e);
            return null;
          }),
        ]);

        const racksCount =
          racksResult?.data?.data?.filter((rack: any) => rack.isActive === true)
            .length ?? 0;
        const plantsCount = plantsResult?.data?.meta?.totalItems ?? 0;

        setSummary([
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
        ]);
      } catch (err) {
        console.error("Summary error:", err);
      } finally {
        setIsSummaryLoading(false);
      }
    };

    // ── Task 2: Load Recent Activity independently ──
    const loadActivity = async () => {
      setIsActivityLoading(true);
      try {
        const careResponse = await plantService
          .getPlantCareActivities(getPlantCare, { page: 1, limit: 50 })
          .catch((e) => {
            console.error("Failed to fetch plant care:", e);
            return null;
          });

        if (!careResponse?.data) {
          setRecentActivity([]);
          return;
        }

        const activities = careResponse.data
          .filter((item: any) => item.eventType?.endsWith("_OFF"))
          .sort(
            (a: any, b: any) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )
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
          });

        setRecentActivity(activities);
      } catch (err) {
        console.error("Activity error:", err);
      } finally {
        setIsActivityLoading(false);
      }
    };

    // Patakbuhin sila nang sabay (walang await dito sa parent function)
    loadSummary();
    loadActivity();
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
      fetchDashboard();
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

  return {
    user,
    highlight,
    summary,
    recentActivity,
    isSummaryLoading,
    isActivityLoading,
    error,
    refetch: fetchDashboard,
    addRack,
    getNotifications,
  };
};
