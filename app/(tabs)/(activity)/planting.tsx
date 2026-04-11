import { typography } from "@/assets/fonts/Text";
import { PlantChart } from "@/components/activity/plantChart";
import { PlantItem } from "@/components/activity/plantingItem";
import { OnboardingTutorialModal } from "@/components/onboarding/tutorialModal";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import Dropdown, { DropdownOption } from "@/components/shared/dropdown";
import useFetch from "@/hooks/useFetch";
import { useOnboarding } from "@/hooks/useOnboarding";
import { plantService } from "@/services/plantService";
import { rackService } from "@/services/rackService";
import { PlantedItemDTO } from "@/types/activity.dto";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  SectionList,
  Text,
  View,
} from "react-native";
import RackIcon from "../../../assets/images/icons/rack(gray).svg";

const screenWidth = Dimensions.get("window").width;

interface ListHeaderProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  plantingChartData: { timestamp: number; value: number }[];
  selectedRack: DropdownOption | null;
  setSelectedRack: (rack: DropdownOption | null) => void;
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

    if (itemDate === today) title = "Today";
    else if (itemDate === yesterday) title = "Yesterday";
    else
      title = new Date(itemDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

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
  selectedRack,
  setSelectedRack,
}) => {
  const [rackOptions, setRackOptions] = useState<DropdownOption[]>([]);
  const [loadingRacks, setLoadingRacks] = useState(false);

  const { refetch: fetchRacks } = useFetch("/racks", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const loadRacks = async () => {
    setLoadingRacks(true);
    try {
      const response = await rackService.getAllUserRack(fetchRacks);
      if (response?.data) {
        const options = response.data
          .filter((rack: any) => rack.isActive)
          .map((rack: any) => ({
            id: rack.id,
            label: rack.name,
            value: rack.id,
          }));
        setRackOptions(options);
      }
    } catch (e) {
      console.error("Failed to load racks:", e);
    } finally {
      setLoadingRacks(false);
    }
  };

  useEffect(() => {
    loadRacks();
  }, []);

  return (
    <View className="bg-white">
      <View className="mt-4 gap-3">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
        <Dropdown
          placeholder="Select your device here"
          options={rackOptions}
          value={selectedRack?.label}
          onSelect={(item) => setSelectedRack(item)}
          label="Selected Rack"
          Icon={RackIcon}
        />
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
};

export default function PlantingScreen() {
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [selectedRack, setSelectedRack] = useState<DropdownOption | null>(null);

  // ── Tutorial Logic ─────────────────────────────────────────────────────────
  const { shouldShow, tutorialStep, handleNextStep } = useOnboarding(
    "planting",
    2,
  );

  const [plants, setPlants] = useState<PlantedItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { refetch: getPlantingActivities } = useFetch(
    "/racks/activities/planting",
    {
      method: "GET",
      autoFetch: false,
      withAuth: true,
    },
  );

  useEffect(() => {
    return () => {
      setSelectedRack(null);
    };
  }, []);

  const getTutorialContent = (step: number) => {
    const chartDataForTutorial =
      plants.length > 0
        ? plants.map((item, index) => ({
            timestamp: index,
            value: parseInt(item.quantity) || 0,
          }))
        : [
            { timestamp: 0, value: 5 },
            { timestamp: 1, value: 12 },
          ];

    switch (step) {
      case 1:
        return {
          title: "Planting Chart",
          desc: "See when each plant began its journey! Monitor planting dates and early growth with ease.",
          image: require("@/assets/nuri/pointing-up.png"),
          position: { bottom: -20, right: -50 },
          offset: 80,
          component: (
            <View className="items-center w-full">
              <PlantChart
                title="Planting"
                data={chartDataForTutorial}
                yLabels={["15", "10", "5", "0"]}
                tooltipLabel="seeds"
                chartWidth={screenWidth - 48}
                chartColor="#86975A"
              />
            </View>
          ),
        };
      case 2:
        return {
          title: "Recent Activities",
          desc: "See what's been happening in your garden! Track every action your plants have received recently.",
          image: require("@/assets/nuri/pointing-down.png"),
          position: { top: 145, right: -70 },
          offset: 480,
          component: (
            <View style={{ width: screenWidth }} className="px-6">
              <Text
                style={typography["button-bold"]}
                className="text-black text-lg mb-3"
              >
                Today
              </Text>
              <PlantItem
                plants={{
                  id: "tutorial-planting",
                  eventType: "PLANT_ADDED",
                  plantName: "Basil",
                  rackName: "My First Rack",
                  time: "09:00 AM",
                  date: new Date(),
                  quantity: "12",
                }}
              />
            </View>
          ),
        };
      default:
        return null;
    }
  };

  const currentTutorial = getTutorialContent(tutorialStep);

  const fetchPlants = useCallback(async () => {
    try {
      setLoading(true);
      const startISO = dateRange.start
        ? new Date(new Date(dateRange.start).setHours(0, 0, 0, 0)).toISOString()
        : undefined;
      const endISO = dateRange.end
        ? new Date(
            new Date(dateRange.end).setHours(23, 59, 59, 999),
          ).toISOString()
        : undefined;

      const response = await plantService.getPlantingActivities(
        getPlantingActivities,
        {
          page: 1,
          limit: 50,
          startDate: startISO,
          endDate: endISO,
          rackId: selectedRack?.value,
        },
      );

      if (response && response.data) {
        const mappedData: PlantedItemDTO[] = response.data.map((item: any) => {
          const dateObj = new Date(item.timestamp);
          const meta = item.metadata || {};
          const eventType = item.eventType;

          let finalPlantName = "Unknown Plant";
          let finalQuantity = "0";
          let oldPlantName = undefined;

          if (eventType === "PLANT_ADDED") {
            finalPlantName = meta.plantName || "Unknown Plant";
            finalQuantity = meta.quantity ? `${meta.quantity}` : "0";
          } else if (eventType === "PLANT_CHANGED") {
            finalPlantName = meta.newPlantName || "Unknown Plant";
            oldPlantName = meta.previousPlantName || "Unknown Plant";
            finalQuantity = meta.quantity ? `${meta.quantity}` : "0";
          } else if (eventType === "PLANT_REMOVED") {
            finalPlantName = meta.plantName || "A plant";
            finalQuantity = meta.quantity ? `${meta.quantity}` : "0";
          }

          return {
            id: item.id,
            eventType: item.eventType,
            plantName: finalPlantName,
            oldPlantName,
            rackName:
              meta.rackName || item.rack?.name || item.rackId || "Unknown Rack",
            time: dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            date: dateObj,
            quantity: finalQuantity,
          };
        });

        setPlants(mappedData);
      }
    } catch (error) {
      console.error("Failed to fetch plants:", error);
      setPlants([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedRack, getPlantingActivities]);

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
    <View className="flex-1 bg-[#F5F5F5]">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-6">
            <PlantItem plants={item} />
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View className="bg-white py-3 px-6">
            <Text
              style={typography["button-bold"]}
              className="text-black text-lg"
            >
              {title}
            </Text>
          </View>
        )}
        ListHeaderComponent={
          <View className="px-6">
            <ListHeader
              dateRange={dateRange}
              setDateRange={setDateRange}
              plantingChartData={plantingChartData}
              selectedRack={selectedRack}
              setSelectedRack={setSelectedRack}
            />
          </View>
        }
        ListEmptyComponent={() => (
          <View className="items-center mt-10 px-6">
            <Text
              style={typography["subheader"]}
              className="text-grayText text-center"
            >
              {loading ? "Loading harvests..." : "No harvests found."}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="bg-white flex-1"
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {shouldShow && currentTutorial && (
        <OnboardingTutorialModal
          visible={shouldShow}
          onClose={handleNextStep}
          title={currentTutorial.title}
          subtitle={currentTutorial.desc}
          topOffset={currentTutorial.offset}
          characterImage={currentTutorial.image}
          characterPosition={currentTutorial.position}
        >
          {currentTutorial.component}
        </OnboardingTutorialModal>
      )}
    </View>
  );
}
