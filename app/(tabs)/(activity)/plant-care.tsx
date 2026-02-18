import { typography } from "@/assets/fonts/Text";
import { ActivityItem } from "@/components/activity/activityItem";
import { PlantChart } from "@/components/activity/plantChart";
import { ActivityButton } from "@/components/activity/sensorToggle";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import { ActivityDTO } from "@/types/activity.dto";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, FlatList, RefreshControl, Text, View } from "react-native";

const screenWidth = Dimensions.get('window').width;

interface ListHeaderProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  activeTab: "water" | "light";
  setActiveTab: (tab: "water" | "light") => void;
  dateToday: Date;
  formatDate: (date: Date) => string;
  waterChartData: { timestamp: number; value: number }[];
  lightChartData: { timestamp: number; value: number }[];
}

const ListHeader: React.FC<ListHeaderProps> = ({ 
  dateRange, 
  setDateRange, 
  activeTab, 
  setActiveTab, 
  dateToday, 
  formatDate,
  waterChartData,
  lightChartData
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
            yLabels={['200ml', '150ml', '100ml', '50ml', '0ml']}
            tooltipLabel="mL"
            chartWidth={screenWidth - 48}
            chartColor="#5EA3B4" 
          />
        ) : (
          <PlantChart 
            title="Grow Light"
            data={lightChartData}
            yLabels={['15min', '10min', '5min', '1min', '0min']}
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

      <View className="mt-4 mb-4 flex-row justify-between items-center">
        <Text style={typography["button-bold"]} className="text-black text-lg">
          {formatDate(dateToday)}
        </Text>
      </View>
    </View>
  );
};

export default function PlantCareScreen() {
  const dateToday = new Date();
  const [activeTab, setActiveTab] = useState<"water" | "light">("water");
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const [activities, setActivities] = useState<ActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const waterChartData = activities
    .filter(a => a.type === 'water')
    .map((item, index) => ({ 
      timestamp: index, 
      value: item.amount || 0 
    }));

  const lightChartData = activities
    .filter(a => a.type === 'light')
    .map((item, index) => ({ 
      timestamp: index, 
      value: item.amount || 0 
    }));

  const listData = activities.filter((item) => item.type === activeTab);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const mockData: (ActivityDTO & { date: Date })[] = [
        { id: "1", type: "water", plantName: "Cherry Tomato", rackName: "Greens Rack", time: "09:00 AM", amount: 180, date: new Date('2026-02-10') },
        { id: "2", type: "water", plantName: "Lettuce", rackName: "Rack A", time: "10:30 AM", amount: 120, date: new Date('2026-02-18') },
        { id: "3", type: "light", plantName: "Basil", rackName: "Rack B", time: "08:00 AM", amount: 12, date: new Date('2026-02-15') },
        { id: "4", type: "light", plantName: "Kale", rackName: "Rack B", time: "09:00 AM", amount: 8, date: new Date('2026-02-18') },
      ];

      if (dateRange.start && dateRange.end) {
        const filtered = mockData.filter((item) => {
          return item.date >= dateRange.start! && item.date <= dateRange.end!;
        });
        setActivities(filtered);
      } else {
        setActivities(mockData);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActivities(); }, [dateRange]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  }, [dateRange]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };
  
  return (
    <FlatList
      data={listData}
      keyExtractor={(item, index) => item.id || index.toString()}
      renderItem={({ item }) => (
        <ActivityItem {...item} />
      )}
      ListHeaderComponent={
        <ListHeader 
          dateRange={dateRange} 
          setDateRange={setDateRange}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dateToday={dateToday}
          formatDate={formatDate}
          waterChartData={waterChartData}
          lightChartData={lightChartData}
        />
      }
      contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 24 }}
      className="bg-white flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={() => (
        <View className="items-center mt-10">
          <Text style={typography["label"]} className="text-gray-400">
            {loading ? "Loading..." : `No ${activeTab} activities found for this range.`}
          </Text>
        </View>
      )}
    />
  );
}