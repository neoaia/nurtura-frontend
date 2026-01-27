import {
    CreateRackRequestDTO,
    CreateRackResponseDTO,
    GetRackInfoDTO,
    HarvestHistoryDTO,
    RackDetailResponseDTO,
    RacksPageResponseDTO,
    UpdateRackRequestDTO,
} from "@/types/rack.dto";
import { useEffect, useState } from "react";

const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

const mockRacksPageData: RacksPageResponseDTO = {
  racks: [
    {
      id: "1",
      name: "Rack 1",
      plant: "Cherry Tomato",
      image: undefined,
      leaves: 12,
      water: 7.5,
      humidity: 65,
      temperature: 24,
      hasAlert: false,
    },
    {
      id: "2",
      name: "Rack 2",
      plant: "Lettuce",
      image: undefined,
      leaves: 8,
      water: 6.2,
      humidity: 70,
      temperature: 22,
      hasAlert: true,
    },
    {
      id: "3",
      name: "Rack 3",
      plant: "Basil",
      image: undefined,
      leaves: 15,
      water: 8.1,
      humidity: 68,
      temperature: 23,
      hasAlert: false,
    },
  ],
  totalHarvest: {
    totalGrams: 1250,
    sinceDate: "January 2026",
    image: undefined,
  },
  careActivities: [
    {
      id: "1",
      type: "water",
      plantName: "Cherry Tomato",
      value: "200ml",
      time: "2 hours ago",
    },
    {
      id: "2",
      type: "light",
      plantName: "Lettuce",
      value: "8 hours",
      time: "4 hours ago",
    },
    {
      id: "3",
      type: "water",
      plantName: "Basil",
      value: "150ml",
      time: "5 hours ago",
    },
  ],
  harvestHistory: [
    {
      id: "1",
      value: "150",
      plantName: "Cherry Tomato",
      time: "1 day ago",
    },
    {
      id: "2",
      value: "200",
      plantName: "Lettuce",
      time: "3 days ago",
    },
    {
      id: "3",
      value: "100",
      plantName: "Basil",
      time: "5 days ago",
    },
  ],
};

export const useRacks = () => {
  const [data, setData] = useState<RacksPageResponseDTO>(mockRacksPageData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRacks = async () => {
    setLoading(true);
    setError(null);
    try {
      // backend
      await new Promise((resolve) => setTimeout(resolve, 500));
      setData(mockRacksPageData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching racks:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRackById = async (
    id: string,
  ): Promise<RackDetailResponseDTO | null> => {
    try {
      // backend

      const rack = mockRacksPageData.racks.find((r) => r.id === id);
      if (!rack) {
        console.warn(`Rack with id ${id} not found`);
        return null;
      }

      return {
        rack,
        plantStatus: {
          temperature: rack.temperature,
          humidity: rack.humidity,
          waterLevel: rack.water,
        },
        careActivities: mockRacksPageData.careActivities.filter(
          (activity) => activity.plantName === rack.plant,
        ),
        harvestHistory: mockRacksPageData.harvestHistory.filter(
          (history) => history.plantName === rack.plant,
        ),
      };
    } catch (err) {
      console.error("Error fetching rack details:", err);
      throw err;
    }
  };

  const createRack = async (
    rackData: CreateRackRequestDTO,
  ): Promise<CreateRackResponseDTO> => {
    try {
      // backend
      console.log("Creating rack:", rackData);

      const newRack: GetRackInfoDTO = {
        id: String(Date.now()),
        name: rackData.name,
        plant: rackData.plantType || "Unknown Plant",
        image: undefined,
        leaves: 0,
        water: 0,
        humidity: 0,
        temperature: 0,
        hasAlert: false,
      };

      setData((prev) => ({
        ...prev,
        racks: [...prev.racks, newRack],
      }));

      return {
        success: true,
        rackId: newRack.id,
        message: "Rack created successfully",
      };
    } catch (err) {
      console.error("Error creating rack:", err);
      throw err;
    }
  };

  const updateRack = async (rackData: UpdateRackRequestDTO): Promise<void> => {
    try {
      // backend

      console.log("Updating rack:", rackData);

      setData((prev) => ({
        ...prev,
        racks: prev.racks.map((rack) =>
          rack.id === rackData.id
            ? {
                ...rack,
                name: rackData.name || rack.name,
                plant: rackData.plantType || rack.plant,
              }
            : rack,
        ),
      }));
    } catch (err) {
      console.error("Error updating rack:", err);
      throw err;
    }
  };

  const deleteRack = async (id: string): Promise<void> => {
    try {
      // backend

      console.log("Deleting rack:", id);

      setData((prev) => ({
        ...prev,
        racks: prev.racks.filter((rack) => rack.id !== id),
      }));
    } catch (err) {
      console.error("Error deleting rack:", err);
      throw err;
    }
  };

  const addCareActivity = async (
    rackId: string,
    activityType: "water" | "light",
    value: string,
  ) => {
    try {
      // backend

      console.log("Adding care activity:", { rackId, activityType, value });

      const rack = data.racks.find((r) => r.id === rackId);
      if (!rack) return;

      const newActivity = {
        id: String(Date.now()),
        type: activityType,
        plantName: rack.plant,
        value,
        time: "just now",
      };

      setData((prev) => ({
        ...prev,
        careActivities: [newActivity, ...prev.careActivities],
      }));

      await fetchRacks();
    } catch (err) {
      console.error("Error adding care activity:", err);
      throw err;
    }
  };

  const addHarvest = async (rackId: string, gramsHarvested: number) => {
    try {
      // backend

      console.log("Adding harvest:", { rackId, gramsHarvested });

      const rack = data.racks.find((r) => r.id === rackId);
      if (!rack) return;

      const newHarvest = {
        id: String(Date.now()),
        value: gramsHarvested.toString(),
        plantName: rack.plant,
        time: "just now",
      };

      setData((prev) => ({
        ...prev,
        harvestHistory: [
          { ...newHarvest } as HarvestHistoryDTO,
          ...prev.harvestHistory,
        ],
        totalHarvest: {
          ...prev.totalHarvest,
          totalGrams: prev.totalHarvest.totalGrams + gramsHarvested,
        },
      }));

      await fetchRacks();
    } catch (err) {
      console.error("Error adding harvest:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRacks();
  }, []);

  return {
    data,
    loading,
    error,

    refetch: fetchRacks,
    getRackById,
    createRack,
    updateRack,
    deleteRack,
    addCareActivity,
    addHarvest,
  };
};
