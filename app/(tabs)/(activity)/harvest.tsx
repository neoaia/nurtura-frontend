import { typography } from "@/assets/fonts/Text";
import { HarvestItem } from "@/components/activity/harvestItem";
import { PlantChart } from "@/components/activity/plantChart";
import { OnboardingTutorialModal } from "@/components/onboarding/tutorialModal";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import Dropdown, { DropdownOption } from "@/components/shared/dropdown";
import useFetch from "@/hooks/useFetch";
import { useOnboarding } from "@/hooks/useOnboarding";
import { plantService } from "@/services/plantService";
import { rackService } from "@/services/rackService";
import { BasePlantItemDTO } from "@/types/activity.dto";
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

type HarvestData = BasePlantItemDTO & { weight: number; date: Date };

interface ListHeaderProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  harvestChartData: { timestamp: number; value: number }[];
  selectedRack: DropdownOption | null;
  setSelectedRack: (rack: DropdownOption | null) => void;
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
  harvestChartData,
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
          title="Harvesting"
          data={harvestChartData}
          yLabels={[]}
          tooltipLabel=""
          chartWidth={screenWidth - 48}
          chartColor="#86975A"
        />
      </View>
    </View>
  );
};

export default function HarvestScreen() {
  // ── Tutorial Logic ─────────────────────────────────────────────────────────
  const { shouldShow, tutorialStep, handleNextStep } = useOnboarding(
    "harvest",
    2,
  );

  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [selectedRack, setSelectedRack] = useState<DropdownOption | null>(null);
  const [harvests, setHarvests] = useState<HarvestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { refetch: getHarvestActivities } = useFetch(
    "/racks/activities/harvest",
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

  const harvestChartData = harvests.map((item, index) => ({
    timestamp: index,
    value: item.weight,
  }));

  const chartDataForTutorial =
    harvests.length > 0
      ? harvestChartData
      : [
          { timestamp: 0, value: 10 },
          { timestamp: 1, value: 15 },
        ];

  const getTutorialContent = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: "Harvest Chart",
          desc: "See how your garden's doing! Track every successful harvest and watch your progress grow.",
          image: require("@/assets/nuri/proud.png"),
          position: { bottom: -90, right: -70 },
          offset: 150,
          component: (
            <View className="items-center w-full">
              <PlantChart
                title="Harvesting"
                data={chartDataForTutorial}
                yLabels={["15", "10", "5", "0"]}
                tooltipLabel=""
                chartWidth={screenWidth - 48}
                chartColor="#86975A"
              />
            </View>
          ),
        };
      case 2:
        return {
          title: "Harvest Status",
          desc: "Monitor real-time harvest data, including yield readiness, progress, and quality indicators",
          image: require("@/assets/nuri/thinking.png"),
          position: { bottom: 0, right: -50 },
          offset: 240,
          component: (
            <View style={{ width: screenWidth }} className="px-6">
              <Text
                style={typography["button-bold"]}
                className="text-black text-lg mb-3"
              >
                Today
              </Text>
              <HarvestItem
                id="tutorial-harvest"
                plantName="Lettuce"
                rackName="My First Rack"
                time="10:30 AM"
                date={new Date()}
              />
            </View>
          ),
        };
      default:
        return null;
    }
  };

  const currentTutorial = getTutorialContent(tutorialStep);

  const fetchHarvests = useCallback(async () => {
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

      const response = await plantService.getPlantHarvestActivities(
        getHarvestActivities,
        {
          page: 1,
          limit: 50,
          startDate: startISO,
          endDate: endISO,
          rackId: selectedRack?.value,
        },
      );

      if (response && response.data) {
        const mappedData: HarvestData[] = response.data.map((item: any) => ({
          id: item.id,
          plantName: item.metadata?.plantName || "Unknown Plant",
          rackName: item.metadata?.rackName || item.rackId || "Unknown Rack",
          time: new Date(item.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: new Date(item.timestamp),
          weight: item.metadata?.quantity || 0,
        }));
        setHarvests(mappedData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedRack, getHarvestActivities]);

  useEffect(() => {
    fetchHarvests();
  }, [fetchHarvests]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHarvests();
    setRefreshing(false);
  }, [fetchHarvests]);

  const sections = groupHarvestsByDate(harvests);

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-6">
            <HarvestItem {...item} />
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
              harvestChartData={harvestChartData}
              selectedRack={selectedRack}
              setSelectedRack={setSelectedRack}
            />
          </View>
        }
        ListEmptyComponent={() => (
          <View className="items-center mt-10 px-6">
            <Text style={typography["label"]} className="text-gray-400">
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
