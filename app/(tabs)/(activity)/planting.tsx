import { typography } from "@/assets/fonts/Text";
import { PlantChart } from "@/components/activity/plantChart";
import { PlantItem } from "@/components/activity/plantingItem";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import useFetch from "@/hooks/useFetch";
import { plantService } from "@/services/plantService";
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

  // Setup useFetch para sa planting activities
  const { refetch: getPlantingActivities } = useFetch(
    "/api/racks/activities/planting",
    {
      method: "GET",
      autoFetch: false,
      withAuth: true,
    },
  );

  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true);

      // Safe date formatting para sa API request
      const startISO = dateRange.start
        ? new Date(new Date(dateRange.start).setHours(0, 0, 0, 0)).toISOString()
        : undefined;
      const endISO = dateRange.end
        ? new Date(
            new Date(dateRange.end).setHours(23, 59, 59, 999),
          ).toISOString()
        : undefined;

      // Tawagin ang backend
      const response = await plantService.getPlantingActivities(
        getPlantingActivities,
        {
          page: 1,
          limit: 50,
          startDate: startISO,
          endDate: endISO,
        },
      );

      if (response && response.data) {
        // I-map ang response data (kunin ang detalye sa 'metadata' at 'rack')
        const mappedData: PlantedItemDTO[] = response.data.map((item: any) => {
          const dateObj = new Date(item.timestamp);

          return {
            id: item.id,
            plantName: item.metadata?.plantName || "Unknown Plant",
            // Priority: rack.name kung meron, fallback sa metadata, then id
            rackName:
              item.rack?.name ||
              item.metadata?.rackName ||
              item.rackId ||
              "Unknown Rack",
            time: dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            date: dateObj,
            // Kino-convert to string kasi string type ang quantity sa PlantedItemDTO mo
            quantity: item.metadata?.quantity
              ? `${item.metadata.quantity}`
              : "0",
          };
        });

        // Kung gusto mo, pwede mong i-filter dito kung 'PLANT_ADDED' lang ang ipapakita
        // const addedPlants = mappedData.filter(item => response.data.find(r => r.id === item.id)?.eventType === 'PLANT_ADDED');
        // setPlants(addedPlants);

        setPlants(mappedData);
      }
    } catch (error) {
      console.error("Failed to fetch plants:", error);
      setPlants([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange, getPlantingActivities]);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlants();
    setRefreshing(false);
  }, [fetchPlants]);

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
