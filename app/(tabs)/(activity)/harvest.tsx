import { typography } from "@/assets/fonts/Text";
import { HarvestItem } from "@/components/activity/harvestItem";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import { BasePlantItemDTO } from "@/types/activity.dto";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

// calendar header
interface ListHeaderProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  dateToday: Date;
  formatDate: (date: Date) => string;
}

const ListHeader: React.FC<ListHeaderProps> = ({ 
  dateRange, 
  setDateRange, 
  dateToday, 
  formatDate 
}) => (
  <View className="bg-white">
    <View className="mt-4">
      <DateRangePicker 
        value={dateRange} 
        onChange={(range) => setDateRange(range)} 
      />
    </View>

    <View className="mt-6 mb-4 flex-row justify-between items-center">
      <Text style={typography["button-bold"]} className="text-black">
        {formatDate(dateToday)}
      </Text>
    </View>
  </View>
);

export default function HarvestScreen() {
  const dateToday = new Date();
  
  // calendar range state
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const [harvests, setHarvests] = useState<BasePlantItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

const fetchHarvests = async () => {
    try {
      setLoading(true);
      const mockHarvesting: BasePlantItemDTO[] = [
        { id: "1", plantName: "Radish", rackName: "Greens", time: "09:18 AM", date: new Date('2026-02-10') },
        { id: "2", plantName: "Lettuce", rackName: "Greens", time: "09:20 AM", date: new Date('2026-02-18') },
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
      keyExtractor={(item, index) => item.id || index.toString()}
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