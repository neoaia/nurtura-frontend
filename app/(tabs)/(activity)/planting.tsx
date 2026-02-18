import { typography } from "@/assets/fonts/Text";
import { PlantChart } from "@/components/activity/plantChart";
import { PlantItem } from "@/components/activity/plantingItem";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import { PlantedItemDTO } from "@/types/activity.dto";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

interface ListHeaderProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  dateToday: Date;
  formatDate: (date: Date) => string;
  plantingChartData: { timestamp: number; value: number }[];
}

const ListHeader: React.FC<ListHeaderProps> = ({ 
  dateRange, 
  setDateRange, 
  dateToday, 
  formatDate,
  plantingChartData 
}) => (
  <View className="bg-white">
    <View className="mt-4">
      <DateRangePicker 
        value={dateRange} 
        onChange={setDateRange} 
      />
    </View>

    {/* Centered Chart Section */}
    <View className="flex-row justify-center w-full py-3">
      <PlantChart 
        title="Planting"
        data={plantingChartData}
        yLabels={['15', '10', '5', '0']}
        tooltipLabel="seeds"
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

export default function PlantingScreen() {
  const dateToday = new Date();
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const [plants, setPlants] = useState<PlantedItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Map mock data to Chart format
  const plantingChartData = plants.map((item, index) => ({
    timestamp: index,
    value: parseInt(item.quantity) || 0,
  }));

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const mockPlanting: (PlantedItemDTO & { date: Date })[] = [
        { id: "1", plantName: "Lettuce", rackName: "Rack A", time: "08:00 AM", quantity: "10", date: new Date('2026-02-10') },
        { id: "2", plantName: "Basil", rackName: "Rack B", time: "09:30 AM", quantity: "5", date: new Date('2026-02-18') },
        { id: "3", plantName: "Mint", rackName: "Rack A", time: "11:00 AM", quantity: "12", date: new Date('2026-02-20') },
      ];

      if (dateRange.start && dateRange.end) {
        const filtered = mockPlanting.filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate >= dateRange.start! && itemDate <= dateRange.end!;
        });
        setPlants(filtered);
      } else {
        setPlants(mockPlanting);
      }
    } catch (error) {
      console.error("Failed to fetch plants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlants(); }, [dateRange]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlants();
    setRefreshing(false);
  }, [dateRange]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <FlatList
      data={plants}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PlantItem plants={item} />}
      ListHeaderComponent={
        <ListHeader 
          dateRange={dateRange} 
          setDateRange={setDateRange}
          dateToday={dateToday}
          formatDate={formatDate}
          plantingChartData={plantingChartData}
        />
      }
      contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 24 }}
      className="bg-white flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={() => (
        <View className="items-center mt-10">
          <Text style={typography["label"]} className="text-gray-400">
            {loading ? "Loading plants..." : "No plants found for this range."}
          </Text>
        </View>
      )}
    />
  );
}