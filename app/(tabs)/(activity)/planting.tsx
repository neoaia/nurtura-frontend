import { typography } from "@/assets/fonts/Text";
import { PlantChart } from "@/components/activity/plantChart";
import { PlantItem } from "@/components/activity/plantingItem";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import { PlantedItemDTO } from "@/types/activity.dto";
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
  plantingChartData: { timestamp: number; value: number }[];
}

const groupPlantsByDate = (data: PlantedItemDTO[]) => {
  const groups: { [key: string]: PlantedItemDTO[] } = {};
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

const ListHeader: React.FC<ListHeaderProps> = ({
  dateRange,
  setDateRange,
  plantingChartData,
}) => (
  <View className="bg-white">
    <View className="mt-4">
      <DateRangePicker value={dateRange} onChange={setDateRange} />
    </View>

    <View className="items-center mt-6 mb-4">
      <PlantChart
        title="Planting"
        data={plantingChartData}
        yLabels={["15", "10", "5", "0"]}
        tooltipLabel="seeds"
        chartWidth={screenWidth - 48}
        chartColor="#86975A"
      />
    </View>
  </View>
);

export default function PlantingScreen() {
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  const [plants, setPlants] = useState<PlantedItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const mockPlanting: PlantedItemDTO[] = [
        {
          id: "1",
          plantName: "Lettuce",
          rackName: "Rack A",
          time: "08:00 AM",
          quantity: "10",
          date: new Date(),
        },
        {
          id: "2",
          plantName: "Bakit",
          rackName: "Rack B",
          time: "09:30 AM",
          quantity: "5",
          date: new Date(Date.now() - 86400000),
        },
        {
          id: "3",
          plantName: "Mint",
          rackName: "Rack A",
          time: "11:00 AM",
          quantity: "12",
          date: new Date("2026-03-25"),
        },
      ];

      const filtered = mockPlanting.filter((item) => {
        if (!dateRange.start || !dateRange.end) return true;

        const itemTime = new Date(item.date).getTime();
        const startTime = new Date(dateRange.start).setHours(0, 0, 0, 0);
        const endTime = new Date(dateRange.end).setHours(23, 59, 59, 999);

        return itemTime >= startTime && itemTime <= endTime;
      });

      setPlants(filtered);
    } catch (error) {
      console.error("Failed to fetch plants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, [dateRange]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlants();
    setRefreshing(false);
  }, [dateRange]);

  const sections = groupPlantsByDate(plants);

  const plantingChartData = plants.map((item, index) => ({
    timestamp: index,
    value: parseInt(item.quantity) || 0,
  }));

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PlantItem plants={item} />}
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
          plantingChartData={plantingChartData}
        />
      }
      ListEmptyComponent={() => (
        <View className="items-center mt-10">
          <Text style={typography["label"]} className="text-gray-400">
            {loading ? "Loading plants..." : "No plants found for this range."}
          </Text>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24 }}
      className="bg-white flex-1"
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}
