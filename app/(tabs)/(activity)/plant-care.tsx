import { typography } from "@/assets/fonts/Text";
import { ActivityItem } from "@/components/activity/activityItem";
import { PlantChart } from "@/components/activity/plantChart";
import { ActivityButton } from "@/components/activity/sensorToggle";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import { ActivityDTO } from "@/types/activity.dto";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  SectionList,
  Text,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

interface ListHeaderProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  activeTab: "water" | "light";
  setActiveTab: (tab: "water" | "light") => void;
  waterChartData: { timestamp: number; value: number }[];
  lightChartData: { timestamp: number; value: number }[];
}

const ListHeader: React.FC<ListHeaderProps> = ({
  dateRange,
  setDateRange,
  activeTab,
  setActiveTab,
  waterChartData,
  lightChartData,
}) => {
  return (
    <View className="bg-white">
      <View className="mt-4">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </View>

      <View className="mt-6 mb-3 items-center">
        {activeTab === "water" ? (
          <PlantChart
            title="Watering"
            data={waterChartData}
            yLabels={["200ml", "150ml", "100ml", "50ml", "0ml"]}
            tooltipLabel="mL"
            chartWidth={screenWidth - 48}
            chartColor="#5EA3B4"
          />
        ) : (
          <PlantChart
            title="Grow Light"
            data={lightChartData}
            yLabels={["15min", "10min", "5min", "1min", "0min"]}
            tooltipLabel="min"
            chartWidth={screenWidth - 48}
            chartColor="#EAE793"
          />
        )}
      </View>

      <View className="flex-row justify-center mb-3 mt-8">
        <ActivityButton
          status={activeTab === "water" ? "clickedWater" : "defaultWater"}
          onPress={() => setActiveTab("water")}
        />
        <ActivityButton
          status={activeTab === "light" ? "clickedLight" : "defaultLight"}
          onPress={() => setActiveTab("light")}
        />
      </View>
    </View>
  );
};

const groupActivitiesByDate = (data: ActivityDTO[]) => {
  const groups: { [key: string]: ActivityDTO[] } = {};
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const yesterday = today - 86400000;

  data.forEach((item) => {
    const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
    let title = "";

    if (itemDate === today) {
      title = "Today";
    } else if (itemDate === yesterday) {
      title = "Yesterday";
    } else {
      title = new Date(itemDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    if (!groups[title]) groups[title] = [];
    groups[title].push(item);
  });

  return Object.keys(groups).map((date) => ({
    title: date,
    data: groups[date],
  }));
};

export default function PlantCareScreen() {
  const [activeTab, setActiveTab] = useState<"water" | "light">("water");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  const [activities, setActivities] = useState<ActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const mockData: ActivityDTO[] = [
        {
          // today
          id: "1",
          type: "water",
          plantName: "Cherry Tomato",
          rackName: "Greens Rack",
          time: "09:00 AM",
          amount: 180,
          date: new Date(),
        },
        {
          // kahapon
          id: "2",
          type: "water",
          plantName: "Lettuce",
          rackName: "Rack A",
          time: "10:30 AM",
          amount: 120,
          date: new Date(Date.now() - 86400000),
        },
        {
          // magpakailanman
          id: "3",
          type: "light",
          plantName: "Basil",
          rackName: "Rack B",
          time: "08:00 AM",
          amount: 12,
          date: new Date("2026-02-15"),
        },
      ];

      const filtered = mockData.filter((item) => {
        if (!dateRange.start || !dateRange.end) return true;

        const itemTime = new Date(item.date).getTime();
        const startTime = new Date(dateRange.start).setHours(0, 0, 0, 0);
        const endTime = new Date(dateRange.end).setHours(23, 59, 59, 999);

        return itemTime >= startTime && itemTime <= endTime;
      });

      setActivities(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [dateRange]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  }, [dateRange]);

  const filteredActivities = activities.filter(
    (item) => item.type === activeTab,
  );
  const sections = groupActivitiesByDate(filteredActivities);

  const waterChartData = activities
    .filter((a) => a.type === "water")
    .map((a, i) => ({ timestamp: i, value: a.amount || 0 }));

  const lightChartData = activities
    .filter((a) => a.type === "light")
    .map((a, i) => ({ timestamp: i, value: a.amount || 0 }));

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ActivityItem {...item} />}
      renderSectionHeader={({ section: { title } }) => (
        <View className="bg-white py-3">
          <Text
            style={typography["button-bold"]}
            className="text-black text-lg"
          >
            {title}
          </Text>
        </View>
      )}
      ListHeaderComponent={
        <ListHeader
          dateRange={dateRange}
          setDateRange={setDateRange}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          waterChartData={waterChartData}
          lightChartData={lightChartData}
        />
      }
      ListEmptyComponent={() => (
        <View className="items-center mt-10">
          <Text style={typography["label"]} className="text-gray-400">
            {loading ? "Loading..." : `No ${activeTab} activities found.`}
          </Text>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24 }}
      className="bg-white flex-1"
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}
