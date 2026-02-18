import { typography } from "@/assets/fonts/Text";
import { ActivityItem } from "@/components/activity/activityItem";
import { ActivityButton } from "@/components/activity/sensorToggle";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import { ActivityDTO } from "@/types/activity.dto";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

// calendar and sensor toggle sa header
interface ListHeaderProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  activeTab: "water" | "light";
  setActiveTab: (tab: "water" | "light") => void;
  dateToday: Date;
  formatDate: (date: Date) => string;
}

const ListHeader: React.FC<ListHeaderProps> = ({ 
  dateRange, 
  setDateRange, 
  activeTab, 
  setActiveTab, 
  dateToday, 
  formatDate 
}) => (
  <View className="bg-white">
    <View className="mt-4">
      <DateRangePicker value={dateRange} onChange={setDateRange} />
    </View>

    <View className="flex-row justify-center mb-3 mt-4">
      <ActivityButton
        status={activeTab === "water" ? "clickedWater" : "defaultWater"}
        onPress={() => setActiveTab("water")}
      />
      <ActivityButton
        status={activeTab === "light" ? "clickedLight" : "defaultLight"}
        onPress={() => setActiveTab("light")}
      />
    </View>

    <View className="mt-6 mb-4 flex-row justify-between items-center">
      <Text style={typography["button-bold"]} className="text-black">
        {formatDate(dateToday)}
      </Text>
    </View>
  </View>
);

export default function PlantCareScreen() {
  const dateToday = new Date()
  const [activeTab, setActiveTab] = useState<"water" | "light">("water");
  
  // calendar range
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  // mock data
  const [activities, setActivities] = useState<ActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const mockData: ActivityDTO[] = [
        // mock datas
        { id: "1", type: "water", plantName: "Cherry Tomato", rackName: "Greens Rack", time: "09:00 AM", amount: 23 },
        { id: "2", type: "water", plantName: "Lettuce", rackName: "Rack A", time: "10:30 AM", amount: 15 },
        { id: "3", type: "light", plantName: "Basil", rackName: "Rack B", time: "08:00 AM", amount: 12 },
      ];

      const filtered = mockData.filter((item) => item.type === activeTab);
      setActivities(filtered);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  }, [activeTab]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };
  
  return (
    <FlatList
      data={activities}
      keyExtractor={(item, index) => item.id || index.toString()}
      renderItem={({ item }) => (
        <ActivityItem
          id={item.id}
          type={item.type}
          plantName={item.plantName}
          rackName={item.rackName}
          time={item.time}
          amount={item.amount}
        />
      )}
      ListHeaderComponent={
        <ListHeader 
          dateRange={dateRange} 
          setDateRange={setDateRange}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dateToday={dateToday}
          formatDate={formatDate}
        />
      }
      contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 24 }}
      className="bg-white flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={() => (
        <View className="items-center mt-10">
          <Text style={typography["label"]} className="text-gray-400">
            {loading ? "Loading activities..." : `No ${activeTab} activities found.`}
          </Text>
        </View>
      )}
    />
  );
}