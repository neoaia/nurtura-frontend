import { typography } from "@/assets/fonts/Text";
import { HarvestItem } from "@/components/activity/harvestItem";
import { PlantChart } from "@/components/activity/plantChart";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import { BasePlantItemDTO } from "@/types/activity.dto";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

type HarvestData = BasePlantItemDTO & { weight: number };

interface ListHeaderProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  dateToday: Date;
  formatDate: (date: Date) => string;
  harvestChartData: { timestamp: number; value: number }[];
}

const ListHeader: React.FC<ListHeaderProps> = ({ 
  dateRange, 
  setDateRange, 
  dateToday, 
  formatDate,
  harvestChartData 
}) => (
  <View className="bg-white">
    <View className="mt-4">
      <DateRangePicker 
        value={dateRange} 
        onChange={setDateRange} 
      />
    </View>

    <View className="flex-row justify-center w-full py-3">
      <PlantChart 
        title="Harvesting"
        data={harvestChartData}
        yLabels={['15kg', '10kg', '5kg', '0kg']}
        tooltipLabel="kg"
        chartWidth={280} 
        chartColor="#86975A"
      />
    </View>

    <View className="mt-6 mb-4 flex-row justify-between items-center">
      <Text style={typography["button-bold"]} className="text-black text-lg">
        {formatDate(dateToday)}
      </Text>
    </View>
  </View>
);

export default function HarvestScreen() {
  const dateToday = new Date();
  
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const [harvests, setHarvests] = useState<HarvestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const harvestChartData = harvests.map((item, index) => ({
    timestamp: index,
    value: item.weight,
  }));

  const fetchHarvests = async () => {
    try {
      setLoading(true);
      
      const mockHarvesting: HarvestData[] = [
        { id: "1", plantName: "Radish", rackName: "Greens", time: "09:18 AM", date: new Date('2026-02-10'), weight: 12 },
        { id: "2", plantName: "Lettuce", rackName: "Greens", time: "09:20 AM", date: new Date('2026-02-18'), weight: 8 },
        { id: "3", plantName: "Spinach", rackName: "Greens", time: "10:00 AM", date: new Date('2026-02-20'), weight: 15 },
      ];

      if (dateRange.start && dateRange.end) {
        const filtered = mockHarvesting.filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate >= dateRange.start! && itemDate <= dateRange.end!;
        });
        setHarvests(filtered);
      } else {
        setHarvests(mockHarvesting); 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvests();
  }, [dateRange]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHarvests();
    setRefreshing(false);
  }, [dateRange]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <FlatList
      data={harvests}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <HarvestItem
          id={item.id}
          plantName={item.plantName}
          rackName={item.rackName}
          time={item.time}
          date={item.date}
        />
      )}
      ListHeaderComponent={
        <ListHeader 
          dateRange={dateRange} 
          setDateRange={setDateRange}
          dateToday={dateToday}
          formatDate={formatDate}
          harvestChartData={harvestChartData}
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
            {loading ? "Loading harvests..." : "No harvests found for this range."}
          </Text>
        </View>
      )}
    />
  );
}