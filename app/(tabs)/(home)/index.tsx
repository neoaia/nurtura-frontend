import { typography } from "@/assets/fonts/Text";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NotificationIcon from "../../../assets/images/notificationIcon.png"; // replace with your actual image
import { Highlight } from "../../../components/home/highlight";
import { RecentActivityBar } from "../../../components/home/recentActivityBar";
import { SummaryCard } from "../../../components/home/summaryCard";

interface DashboardDTO {
  user: {
    name: string;
    hasNotifications: boolean;
  };
  summary: {
    id: string;
    type: string;
    value: number | null;
  }[];
  highlight: {
    title: string;
    description: string;
    buttonText: string;
  };
  recentActivity: {
    id: string;
    type: "water" | "light";
    action: string;
    plant: string;
    timestamp: string;
    amount?: string;
    duration?: string;
  }[];
}

// Mock data
const mockApiResponse: DashboardDTO = {
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
      amount: "76 mL",
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

// API
const apiService = {
  fetchDashboard: async (): Promise<DashboardDTO> => {
    try {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockApiResponse), 500);
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      throw error;
    }
  },

  addRack: async (rackData: any) => {
    try {
      console.log("Adding rack:", rackData);
      return { success: true };
    } catch (error) {
      console.error("Error adding rack:", error);
      throw error;
    }
  },

  getNotifications: async () => {
    try {
      return { notifications: [] };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },
};

export default function HomeScreen() {
  const [data, setData] = useState<DashboardDTO>(mockApiResponse);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const dashboardData = await apiService.fetchDashboard();
      setData(dashboardData);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async () => {
    console.log("Notification pressed");
    const notifications = await apiService.getNotifications();
    router.push("/notifications");
  };

  const handleCardPress = (cardType: string) => {
    console.log("Card pressed:", cardType);
  };

  const handleAddRack = async () => {
    try {
      await apiService.addRack({ name: "New Rack" });
      loadDashboard();
    } catch (error) {
      console.error("Failed to add rack:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#7a8f5e] items-center justify-center">
        <Text className="text-xl text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-10 pt-4 pb-2 flex-row items-center justify-between">
          <Text style={typography["h1-bold"]} className=" text-white">
            Hi {data.user.name}!
          </Text>
          <TouchableOpacity
            onPress={handleNotificationPress}
            className="relative p-2"
            activeOpacity={0.7}
          >
            <Image
              source={NotificationIcon}
              className="w-6 h-6"
              resizeMode="contain"
            />

            {data.user.hasNotifications && (
              <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="pt-4">
          <View className="px-4">
            <SummaryCard cards={data.summary} onCardPress={handleCardPress} />
          </View>

          <View className="bg-white rounded-t-2xl p-6 shadow-lg">
            <Highlight
              title={data.highlight.title}
              description={data.highlight.description}
              buttonText={data.highlight.buttonText}
              onButtonPress={handleAddRack}
            />

            <RecentActivityBar activities={data.recentActivity} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
