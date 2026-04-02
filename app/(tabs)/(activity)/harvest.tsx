import { typography } from "@/assets/fonts/Text";
import { HarvestItem } from "@/components/activity/harvestItem";
import { PlantChart } from "@/components/activity/plantChart";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import useFetch from "@/hooks/useFetch";
import { plantService } from "@/services/plantService";
import { BasePlantItemDTO } from "@/types/activity.dto";
import React, { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    RefreshControl,
    SectionList,
    Text,
    View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

type HarvestData = BasePlantItemDTO & { weight: number; date: Date };

interface ListHeaderProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  harvestChartData: { timestamp: number; value: number }[];
}

const groupHarvestsByDate = (data: HarvestData[]) => {
  const groups: { [key: string]: HarvestData[] } = {};
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
  harvestChartData,
}) => (
  <View className="bg-white">
    <View className="mt-4">
      <DateRangePicker value={dateRange} onChange={setDateRange} />
    </View>

    <View className="items-center mt-6 mb-4">
      <PlantChart
        title="Harvesting"
        data={harvestChartData}
        // Pwede mong gawing dynamic itong yLabels depende sa max value later
        yLabels={["15", "10", "5", "0"]}
        tooltipLabel=""
        chartWidth={screenWidth - 48}
        chartColor="#86975A"
      />
    </View>
  </View>
);

export default function HarvestScreen() {
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  const [harvests, setHarvests] = useState<HarvestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Setup useFetch gamit ang harvest endpoint
  const { refetch: getHarvestActivities } = useFetch(
    "/racks/activities/harvest",
    {
      method: "GET",
      autoFetch: false,
      withAuth: true,
    },
  );

  const fetchHarvests = useCallback(async () => {
    try {
      setLoading(true);

      // Safe date formatting para hindi ma-mutate ang main state
      const startISO = dateRange.start
        ? new Date(new Date(dateRange.start).setHours(0, 0, 0, 0)).toISOString()
        : undefined;
      const endISO = dateRange.end
        ? new Date(
            new Date(dateRange.end).setHours(23, 59, 59, 999),
          ).toISOString()
        : undefined;

      // Tawagin ang endpoint mula sa plantService
      const response = await plantService.getPlantHarvestActivities(
        getHarvestActivities,
        {
          page: 1,
          limit: 50,
          startDate: startISO,
          endDate: endISO,
        },
      );

      if (response && response.data) {
        // I-map ang response data (kunin ang detalye sa 'metadata')
        const mappedData: HarvestData[] = response.data.map((item: any) => {
          const dateObj = new Date(item.timestamp);

          return {
            id: item.id,
            plantName: item.metadata?.plantName || "Unknown Plant",
            rackName: item.metadata?.rackName || item.rackId || "Unknown Rack",
            time: dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            date: dateObj,
            // Kino-convert natin yung 'quantity' from API to 'weight' for the UI
            weight: item.metadata?.quantity || 0,
          };
        });

        setHarvests(mappedData);
      }
    } catch (error) {
      console.error("Failed to fetch harvest activities:", error);
      setHarvests([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange, getHarvestActivities]);

  useEffect(() => {
    fetchHarvests();
  }, [fetchHarvests]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHarvests();
    setRefreshing(false);
  }, [fetchHarvests]);

  const sections = groupHarvestsByDate(harvests);

  const harvestChartData = harvests.map((item, index) => ({
    timestamp: index,
    value: item.weight,
  }));

  return (
    <SectionList
      sections={sections}
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
          harvestChartData={harvestChartData}
        />
      }
      ListEmptyComponent={() => (
        <View className="items-center mt-10">
          <Text style={typography["label"]} className="text-gray-400">
            {loading
              ? "Loading harvests..."
              : "No harvests found for this range."}
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
