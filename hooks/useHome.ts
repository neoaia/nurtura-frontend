import { useEffect, useState } from "react";
import {
    AddRackRequestDTO,
    AddRackResponseDTO,
    DashboardResponseDTO,
    NotificationsResponseDTO,
} from "../types/home.dto";

const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

// Mock data
const mockApiResponse: DashboardResponseDTO = {
  user: {
    name: "Juan",
    hasNotifications: true,
  },
  summary: [
    {
      id: "racks",
      type: "racks",
      value: 2,
    },
    {
      id: "plants",
      type: "plants",
      value: 2,
    },
  ],
  highlight: {
    title: "Farm Efficiently",
    description: "Start growing your plant with Nurtura Racks.",
    buttonText: "Add a Rack",
  },
  recentActivity: [
    {
      id: "1",
      type: "water",
      action: "Watered the",
      plant: "Cherry Tomato",
      timestamp: "9:18 AM",
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

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      //backend

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setData(mockApiResponse);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const addRack = async (
    rackData: AddRackRequestDTO,
  ): Promise<AddRackResponseDTO> => {
    try {
      //backend

      console.log("Adding rack:", rackData);
      await fetchDashboard(); // Refresh data
      return { success: true, message: "Rack added successfully" };
    } catch (err) {
      console.error("Error adding rack:", err);
      throw err;
    }
  };

  const getNotifications = async (): Promise<NotificationsResponseDTO> => {
    try {
      //backend

      return {
        notifications: [],
        unreadCount: 0,
      };
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
