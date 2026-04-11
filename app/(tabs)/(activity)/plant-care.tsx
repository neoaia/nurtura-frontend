import { typography } from "@/assets/fonts/Text";
import { ActivityItem } from "@/components/activity/activityItem";
import { PlantChart } from "@/components/activity/plantChart";
import { ActivityButton } from "@/components/activity/sensorToggle";
import { OnboardingTutorialModal } from "@/components/onboarding/tutorialModal";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import Dropdown, { DropdownOption } from "@/components/shared/dropdown";
import useFetch from "@/hooks/useFetch";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useSocket } from "@/hooks/useSocket";
import { plantService } from "@/services/plantService";
import { rackService } from "@/services/rackService";
import { ActivityDTO } from "@/types/activity.dto";
import { AutomationActivity } from "@/types/socket.interface";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  SectionList,
  Text,
  View,
} from "react-native";
import RackIcon from "../../../assets/images/icons/rack(gray).svg";

const screenWidth = Dimensions.get("window").width;
const CHART_SECTION_HEIGHT = 420;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns true when `date` falls within the [start, end] range.
 * Null boundaries are treated as open-ended.
 */
const isWithinDateRange = (
  date: Date,
  range: { start: Date | null; end: Date | null },
): boolean => {
  if (
    range.start &&
    date < new Date(new Date(range.start).setHours(0, 0, 0, 0))
  )
    return false;
  if (
    range.end &&
    date > new Date(new Date(range.end).setHours(23, 59, 59, 999))
  )
    return false;
  return true;
};

const mapAutomationActivityToDTO = (
  activity: AutomationActivity,
): ActivityDTO => {
  const dateObj = new Date(activity.timestamp);
  const isWater =
    activity.eventType === "WATERING_START" ||
    activity.eventType === "WATERING_STOP";

  return {
    id: activity.id,
    type: isWater ? "water" : "light",
    eventType: activity.eventType as ActivityDTO["eventType"], // ← add this
    plantName: activity.metadata?.plantName || "Plants",
    rackName: activity.metadata?.rackName || "Unknown Rack",
    time: dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    date: dateObj,
    amount: activity.metadata?.waterUsedMl,
    duration: activity.metadata?.durationSeconds
      ? `${Math.round(activity.metadata.durationSeconds / 60)} mins`
      : undefined,
  };
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

// ─── ListHeader ──────────────────────────────────────────────────────────────

interface ListHeaderProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  activeTab: "water" | "light";
  setActiveTab: (tab: "water" | "light") => void;
  waterChartData: { timestamp: number; value: number }[];
  lightChartData: { timestamp: number; value: number }[];
  selectedRack: DropdownOption | null;
  setSelectedRack: (rack: DropdownOption | null) => void;
  rackOptions: DropdownOption[];
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
  rackOptions,
}) => {
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

      <View className="mt-6 mb-3 items-center">
        {activeTab === "water" ? (
          <PlantChart
            title="Watering"
            data={waterChartData}
            yLabels={[]}
            tooltipLabel="mL"
            chartWidth={screenWidth - 48}
            chartColor="#5EA3B4"
          />
        ) : (
          <PlantChart
            title="Grow Light"
            data={lightChartData}
            yLabels={[]}
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

// ─── PlantCareScreen ─────────────────────────────────────────────────────────

export default function PlantCareScreen() {
  // ── Tutorial Logic ──────────────────────────────────────────────────────────
  const { shouldShow, tutorialStep, handleNextStep } = useOnboarding(
    "plant-care",
    3,
  );

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
                eventType="WATERING_STOP"
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

  // ── State ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"water" | "light">("water");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [selectedRack, setSelectedRack] = useState<DropdownOption | null>(null);
  const [rackOptions, setRackOptions] = useState<DropdownOption[]>([]);
  const [activities, setActivities] = useState<ActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Tracks which rack IDs we're currently subscribed to via WebSocket,
  // so we can cleanly unsubscribe before switching to a new set.
  const subscribedRackIdsRef = useRef<string[]>([]);

  // ── Socket ──────────────────────────────────────────────────────────────────
  const { isConnected, socketService } = useSocket();

  // ── HTTP fetchers ───────────────────────────────────────────────────────────
  const { refetch: fetchRacks } = useFetch("/racks", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: getPlantCare } = useFetch("/racks/activities/plant-care", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  // ── Load rack list ──────────────────────────────────────────────────────────
  const loadRacks = useCallback(async () => {
    try {
      const response = await rackService.getAllUserRack(fetchRacks);
      if (response?.data) {
        const options: DropdownOption[] = response.data
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
    }
  }, [fetchRacks]);

  useEffect(() => {
    loadRacks();
  }, [loadRacks]);

  // ── HTTP: initial activity load ─────────────────────────────────────────────
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
        // FIX: Moved mappedData declaration outside .map() so console.log works correctly
        const mappedData: ActivityDTO[] = response.data.map((item: any) => {
          console.log("item.metadata:", JSON.stringify(item.metadata));
          const dateObj = new Date(item.timestamp);
          const isWater =
            item.eventType?.includes("WATERING") ||
            item.eventType?.includes("WATER");

          return {
            id: item.id,
            type: (isWater ? "water" : "light") as "water" | "light",
            eventType: item.eventType as ActivityDTO["eventType"], // ← add this
            plantName: item.metadata?.ruleName || "Plants",
            rackName:
              item.metadata?.rackName || item.rack?.name || "Unknown Rack",
            time: dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            date: dateObj,
            amount: item.metadata?.waterUsedMl ?? item.metadata?.amount,
            duration: item.metadata?.durationSeconds
              ? `${Math.round(item.metadata.durationSeconds / 60)} mins`
              : item.metadata?.duration
                ? `${Math.round(item.metadata.duration / 60000)} mins`
                : undefined,
          };
        });
        console.log("Fetched activities:", mappedData);
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

  // ── WebSocket: rack subscription management ─────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;

    // Unsubscribe from whatever we had before
    subscribedRackIdsRef.current.forEach((id) =>
      socketService.unsubscribeFromRack(id),
    );

    const idsToSubscribe = selectedRack
      ? [selectedRack.value]
      : rackOptions.map((r) => r.value);

    idsToSubscribe.forEach((id) => socketService.subscribeToRack(id));
    subscribedRackIdsRef.current = idsToSubscribe;

    return () => {
      subscribedRackIdsRef.current.forEach((id) =>
        socketService.unsubscribeFromRack(id),
      );
      subscribedRackIdsRef.current = [];
    };
  }, [isConnected, selectedRack, rackOptions, socketService]);

  // ── WebSocket: listen for new automation events ─────────────────────────────
  useEffect(() => {
    const handleAutomationEvent = (data: any) => {
      // FIX: Handle both payload shapes — { event, activity } or the raw activity object directly
      const activity: AutomationActivity = data?.event.activity ?? data;
      console.log("activity.metadata:", JSON.stringify(activity.metadata));

      // FIX: Guard against malformed/undefined payloads before accessing .timestamp
      if (!activity || !activity.timestamp) {
        console.warn("Received malformed automation event:", data);
        return;
      }

      const eventDate = new Date(activity.timestamp);

      // Drop the event if it falls outside the current date filter
      if (!isWithinDateRange(eventDate, dateRange)) return;

      // Drop if a rack filter is active and the event belongs to a different rack
      if (selectedRack && activity.rackId !== selectedRack.value) return;

      const newActivity = mapAutomationActivityToDTO(activity);

      setActivities((prev) => {
        // Guard against duplicate events (e.g. after a reconnect)
        if (prev.some((a) => a.id === newActivity.id)) return prev;
        return [newActivity, ...prev];
      });
    };

    socketService.on("automationEvent", handleAutomationEvent);
    return () => socketService.off("automationEvent", handleAutomationEvent);
  }, [dateRange, selectedRack, socketService]);

  // ── Clear selected rack on unmount ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      setSelectedRack(null);
    };
  }, []);

  // ── Pull-to-refresh ─────────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  }, [fetchActivities]);

  // ── Derived data ────────────────────────────────────────────────────────────
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

  // ── Render ──────────────────────────────────────────────────────────────────
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
            rackOptions={rackOptions}
          />
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
        className="bg-white flex-1 px-6"
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
