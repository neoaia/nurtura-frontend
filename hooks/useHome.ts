import { useCallback, useEffect, useState } from "react";
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
  recentActivity: [
    {
      id: "1",
      type: "water",
      action: "Watered the",
      plant: "Cherry Tomato",
      timestamp: "9:18 AM",
      duration: "2 mins",
    },
    {
      id: "2",
      type: "light",
      action: "Gave light to",
      plant: "Cherry Tomato",
      timestamp: "9:28 AM",
      duration: "2 mins",
    },
    {
      id: "3",
      type: "light",
      action: "Gave light to",
      plant: "Cherry Tomato",
      timestamp: "9:18 AM",
      duration: "2 mins",
    },
  ],
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

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [racksResult, plantsResult] = await Promise.all([
        fetchRacks(),
        fetchPlants(),
      ]);

      console.log("Racks result:", racksResult);
      console.log("Plants result:", plantsResult);

      // Adjust these field names based on what your API actually returns
      const racksCount =
        racksResult?.data?.data?.filter((rack: any) => rack.isActive === true)
          .length ?? 0;
      const plantsCount = plantsResult?.data?.meta?.totalItems ?? 0;

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
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchRacks, fetchPlants]);

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

      await fetchDashboard(); // refresh counts
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
