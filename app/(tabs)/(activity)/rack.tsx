import { typography } from "@/assets/fonts/Text";
import {
  RackActivityItem,
  RackActivityItemProps,
} from "@/components/activity/rackActivityItem";
import { OnboardingTutorialModal } from "@/components/onboarding/tutorialModal";
import { DateRangePicker } from "@/components/shared/datetimepicker";
import Dropdown, { DropdownOption } from "@/components/shared/dropdown";
import useFetch from "@/hooks/useFetch";
import { useOnboarding } from "@/hooks/useOnboarding";
import { activityService } from "@/services/activityService";
import { rackService } from "@/services/rackService";
import { GetRackActivitiesResponseDTO } from "@/types/activity.dto";
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
  selectedRack: DropdownOption | null;
  setSelectedRack: (rack: DropdownOption | null) => void;
}

const ListHeader: React.FC<ListHeaderProps> = ({
  dateRange,
  setDateRange,
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
      <View className="mt-4 mb-4 gap-3">
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
    </View>
  );
};

const groupActivitiesByDate = (
  data: (RackActivityItemProps & { timestamp: string })[],
) => {
  const groups: { [key: string]: RackActivityItemProps[] } = {};
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const yesterday = today - 86400000;

  data.forEach((item) => {
    const itemDate = new Date(item.timestamp).setHours(0, 0, 0, 0);
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

const toActivityItemProps = (
  item: any,
): RackActivityItemProps & { timestamp: string } => {
  const dateObj = new Date(item.timestamp);
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const isRenamed = item.eventType === "RACK_RENAMED";
  const rackNameNew = isRenamed ? item.metadata?.newName : undefined;
  const fetchedRackName = isRenamed
    ? item.metadata?.oldName
    : item.metadata?.rackName;

  return {
    id: item.id,
    eventType: item.eventType,
    rackName:
      fetchedRackName || item.rack?.name || item.rackId || "Unknown Rack",
    rackNameNew,
    date: dateStr,
    time,
    timestamp: item.timestamp,
  };
};

export default function RackActivity() {
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [selectedRack, setSelectedRack] = useState<DropdownOption | null>(null);

  // ── Tutorial Logic ─────────────────────────────────────────────────────────
  const { shouldShow, tutorialStep, handleNextStep, handleSkip } =
    useOnboarding("rack-activity", 2);

  const [activities, setActivities] = useState<
    (RackActivityItemProps & { timestamp: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { refetch: getRackActivities } = useFetch("/racks/activities", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  useEffect(() => {
    return () => {
      setSelectedRack(null);
    };
  }, []);

  const getTutorialContent = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: "Activity Calendar",
          desc: "Filter your rack history by date! Easily find exactly when a rack was added, renamed, or modified.",
          image: require("@/assets/nuri/pointing-up.png"),
          position: { bottom: 0, right: -50 },
          offset: 180,
          component: (
            <View className="px-6">
              <DateRangePicker value={dateRange} onChange={() => {}} />
            </View>
          ),
        };
      case 2:
        return {
          title: "Rack Updates",
          desc: "Stay informed about your hardware! Track every name change and system update across your indoor farm.",
          image: require("@/assets/nuri/joyful.png"),
          position: { bottom: 20, left: -80 },
          offset: 200,
          component: (
            <View style={{ width: screenWidth }} className="px-6">
              <Text
                style={typography["button-bold"]}
                className="text-black text-lg mb-3"
              >
                Today
              </Text>
              <RackActivityItem
                id="tutorial-rack"
                eventType="RACK_RENAMED"
                rackName="Old Rack Name"
                rackNameNew="New Smart Rack"
                date="April 3, 2026"
                time="01:30 PM"
              />
            </View>
          ),
        };
      default:
        return null;
    }
  };

  const currentTutorial = getTutorialContent(tutorialStep);

  const fetchActivities = useCallback(async () => {
    try {
      const startISO = dateRange.start
        ? new Date(new Date(dateRange.start).setHours(0, 0, 0, 0)).toISOString()
        : undefined;
      const endISO = dateRange.end
        ? new Date(
            new Date(dateRange.end).setHours(23, 59, 59, 999),
          ).toISOString()
        : undefined;

      const response: GetRackActivitiesResponseDTO =
        await activityService.getRackActivities(getRackActivities, {
          page: 1,
          limit: 50,
          startDate: startISO,
          endDate: endISO,
          rackId: selectedRack?.value,
        });

      if (response && response.data) {
        setActivities(response.data.map(toActivityItemProps));
      }
    } catch (error) {
      console.error("Failed to fetch rack activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [getRackActivities, selectedRack, dateRange]);

  useEffect(() => {
    setLoading(true);
    fetchActivities();
  }, [fetchActivities]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  }, [fetchActivities]);

  const sections = groupActivitiesByDate(activities);

  return (
    <View className="flex-1 bg-white">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-6">
            <RackActivityItem {...item} />
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
              selectedRack={selectedRack}
              setSelectedRack={setSelectedRack}
            />
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        className="bg-white flex-1"
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
      />

      {shouldShow && currentTutorial && (
        <OnboardingTutorialModal
          visible={shouldShow}
          onClose={handleNextStep}
          onSkip={handleSkip}
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
