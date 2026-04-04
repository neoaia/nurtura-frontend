import { typography } from "@/assets/fonts/Text";
import { ActivityItem } from "@/components/activity/activityItem";
import { PlantChart } from "@/components/activity/plantChart";
import { ActivityButton } from "@/components/activity/sensorToggle";
import { OnboardingTutorialModal } from "@/components/onboarding/tutorialModal";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import Dropdown, { DropdownOption } from "@/components/shared/dropdown";
import useFetch from "@/hooks/useFetch";
import { plantService } from "@/services/plantService";
import { ActivityDTO } from "@/types/activity.dto";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  SectionList,
  Text,
  View,
} from "react-native";

import { rackService } from "@/services/rackService";
import RackIcon from "../../../assets/images/icons/rack(gray).svg";

const screenWidth = Dimensions.get("window").width;
const CHART_SECTION_HEIGHT = 420;

interface ListHeaderProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  activeTab: "water" | "light";
  setActiveTab: (tab: "water" | "light") => void;
  waterChartData: { timestamp: number; value: number }[];
  lightChartData: { timestamp: number; value: number }[];
  selectedRack: DropdownOption | null;
  setSelectedRack: (rack: DropdownOption | null) => void;
}

const ListHeader: React.FC<ListHeaderProps> = ({
  dateRange,
  setDateRange,
  activeTab,
  setActiveTab,
  waterChartData,
  lightChartData,
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
        ></Dropdown>
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
  const [tutorialStep, setTutorialStep] = useState(1);
  const TOTAL_STEPS = 3;

  const handleNextStep = () => {
    setTutorialStep((prev) => {
      const next = prev + 1;
      return next > TOTAL_STEPS ? 0 : next;
    });
  };

  const getTutorialContent = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: "Water Activity",
          desc: "See when and how your plants were watered! Stay on top of every drop your greens receive.",
          image: require("@/assets/nuri/pointing-up.png"),
          position: { bottom: 0, right: -50 },
          offset: CHART_SECTION_HEIGHT - 120,
          component: (
            <View className="flex-row justify-center">
              <ActivityButton status="clickedWater" onPress={() => {}} />
            </View>
          ),
        };
      case 2:
        return {
          title: "Light Activity",
          desc: "See when and how your plants are exposed to sunlight! Stay on top of every lights your greens receive.",
          image: require("@/assets/nuri/pointing-up.png"),
          position: { bottom: 0, right: -50 },
          offset: CHART_SECTION_HEIGHT - 120,
          component: (
            <View className="flex-row justify-center">
              <ActivityButton status="clickedLight" onPress={() => {}} />
            </View>
          ),
        };
      case 3:
        return {
          title: "Care Logs",
          desc: "Review specific details for each activity.",
          image: require("@/assets/nuri/pointing-up.png"),
          position: { bottom: 0, right: -50 },
          offset: 580,
          component: (
            <View style={{ width: screenWidth }} className="px-6">
              <Text
                style={typography["button-bold"]}
                className="text-black text-lg mb-3"
              >
                February 10, 2026
              </Text>
              <ActivityItem
                id="tutorial-id"
                type="water"
                plantName="Basil - High Moisture Stop"
                rackName="Kitchen Herb Rack"
                time="5:04 PM"
                date={new Date("2026-02-10")}
              />
            </View>
          ),
        };
      default:
        return null;
    }
  };

  const currentTutorial = getTutorialContent(tutorialStep);
  const [activeTab, setActiveTab] = useState<"water" | "light">("water");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [selectedRack, setSelectedRack] = useState<DropdownOption | null>(null);

  const [activities, setActivities] = useState<ActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { refetch: getPlantCare } = useFetch("/racks/activities/plant-care", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  useEffect(() => {
    return () => {
      setSelectedRack(null);
    };
  }, []);

  const fetchActivities = useCallback(async () => {
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

      const response = await plantService.getPlantCareActivities(getPlantCare, {
        page: 1,
        limit: 50,
        startDate: startISO,
        endDate: endISO,
        rackId: selectedRack?.value,
      });

      if (response?.data) {
        const mappedData: ActivityDTO[] = response.data
          .filter((item: any) => item.eventType?.endsWith("_OFF"))
          .map((item: any) => {
            const dateObj = new Date(item.timestamp);
            const isWater = item.eventType.includes("WATERING");
            return {
              id: item.id,
              type: (isWater ? "water" : "light") as "water" | "light",
              plantName: item.metadata?.ruleName || "Plants",
              rackName:
                item.metadata?.rackName || item.rack?.name || "Unknown Rack",
              time: dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              date: dateObj,
              amount: item.metadata?.amount,
              duration: item.metadata?.duration
                ? `${Math.round(item.metadata.duration / 60000)} mins`
                : undefined,
            };
          });
        setActivities(mappedData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedRack, getPlantCare]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  }, [fetchActivities]);

  const filteredActivities = activities.filter(
    (item) => item.type === activeTab,
  );
  const sections = groupActivitiesByDate(filteredActivities);

  const waterChartData = activities
    .filter((a) => a.type === "water")
    .map((a, i) => ({ timestamp: i, value: a.amount || 0 }));
  const lightChartData = activities
    .filter((a) => a.type === "light")
    .map((a, i) => ({
      timestamp: i,
      value: a.duration ? parseInt(a.duration) : 0,
    }));

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityItem {...item} />}
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
          <ListHeader
            dateRange={dateRange}
            setDateRange={setDateRange}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            waterChartData={waterChartData}
            lightChartData={lightChartData}
            selectedRack={selectedRack}
            setSelectedRack={setSelectedRack}
          />
        }
        ListEmptyComponent={() => (
          <View className="items-center mt-10">
            <Text style={typography["label"]} className="text-gray-400">
              {loading ? "Loading..." : `No ${activeTab} activities found.`}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="bg-white flex-1 px-6"
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {tutorialStep > 0 && currentTutorial && (
        <OnboardingTutorialModal
          visible={true}
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
