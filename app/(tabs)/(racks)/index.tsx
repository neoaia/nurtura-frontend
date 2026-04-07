import { typography } from "@/assets/fonts/Text";
import { OnboardingTutorialModal } from "@/components/onboarding/tutorialModal"; // Added
import AddRackButton from "@/components/racks/addRackItemBtn";
import RackItem from "@/components/racks/rackItem";
import RackItemSkeleton from "@/components/racks/skeleton/rackItemSkeleton";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService";
import { GetRackInfoDTO } from "@/types/rack.dto";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ArchiveButton from "../../../assets/buttons/archive.svg";

const SKELETON_COUNT = 3;
const screenHeight = Dimensions.get("window").height;

export default function RacksScreen() {
  const [racks, setRacks] = useState<GetRackInfoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLoadedOnce = useRef(false);

  // ── Tutorial Logic ────────────────────────────────────────────────────────
  const [tutorialStep, setTutorialStep] = useState(1);
  const TOTAL_STEPS = 4;

  const handleNextStep = () => {
    setTutorialStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : 0));
  };

  const getTutorialContent = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: "Your Nurtura Rack",
          desc: "See every detail about your plants — from soil moisture to sunlight and growth progress.",
          image: require("@/assets/nuri/thinking.png"),
          position: { bottom: 0, right: -70 },
          offset: 130,
          component: (
            <View className="px-4 w-full">
              <RackItem
                rack={{
                  id: "tutorial-rack",
                  name: "Greens",
                  plant: "Empty",
                  seeds: 0,
                  water: 0,
                  humidity: 0,
                  temperature: 0,
                  hasAlert: false,
                  onPress: () => {},
                  onMorePress: () => {},
                }}
              />
            </View>
          )
        };
      case 2:
        return {
          title: "Add a Nurtura Rack",
          desc: "Set up a new home for your greens — link sensors, pumps, and lights with one tap.",
          image: require("@/assets/nuri/pointing-up.png"),
          position: { bottom: -60, right: -50 },
          offset: 320,
          component: (
            <View className="px-4 w-full">
              <AddRackButton onPress={() => {}} />
            </View>
          )
        };
      case 3:
        return {
          title: "Quick Add",
          desc: "Need a new rack or plant? Add it here in seconds and get growing right away.",
          image: require("@/assets/nuri/pointing-down.png"),
          position: { bottom: 290, right: -50 },
          offset: screenHeight - 300,
          component: (
            <View className="items-center justify-center">
               <View className="bg-white p-4 rounded-[20px] items-center justify-center shadow-sm w-[72px] h-[72px]">
                <Text className="text-primary text-4xl">+</Text>
              </View>
            </View>
          )
        };
      case 4:
        return {
          title: "Activity",
          desc: "See what your garden’s been up to! Track watering, growth, and all your plant care moments.",
          image: require("@/assets/nuri/joyful.png"),
          position: { bottom: 290, right: -50 },
          offset: screenHeight - 300,
          component: (
            <View className="items-center justify-center">
              <View className="bg-white p-4 rounded-[20px] items-center justify-center shadow-sm w-[72px] h-[72px]">
                <Image
                  source={require("@/assets/images/bottom-nav/bm-activity-inactive.png")}
                  style={{ width: 22, height: 22 }}
                  resizeMode="contain"
                />
              </View>
            </View>
          )
        };
      default:
        return null;
    }
  };

  const currentTutorial = getTutorialContent(tutorialStep);

  // ── API Fetch Logic ───────────────────────────────────────────────────────
  const { refetch: getAllRacks } = useFetch("/racks", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const fetchRacks = useCallback(async () => {
    try {
      setError(null);
      const response = await rackService.getAllUserRack(getAllRacks);

      if (response?.data) {
        const mappedRacks: GetRackInfoDTO[] = response.data
          .filter((rack: any) => rack.isActive === true)
          .map((rack: any) => ({
            id: rack.id,
            name: rack.name,
            plant: rack.currentPlant?.name ?? "No plant",
            image: undefined,
            seeds: rack.quantity ?? 0,
            water: 0,
            humidity: 0,
            temperature: 0,
            hasAlert: rack.status === "offline" || rack.status === "error",
          }));
        setRacks(mappedRacks);
      } else {
        setRacks([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load racks";
      setError(message);
    } finally {
      hasLoadedOnce.current = true;
      setLoading(false);
    }
  }, [getAllRacks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRacks();
    setRefreshing(false);
  }, [fetchRacks]);

  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedOnce.current) setLoading(true);
      fetchRacks();
    }, [fetchRacks]),
  );

  const handleCardPress = useCallback((rackId: string) => {
    router.push(`/(tabs)/(racks)/${rackId}` as any);
  }, []);

  const handleAddRack = useCallback(() => {
    router.push("/(tabs)/(add_pages)/(addNewRack)");
  }, []);

  const handlePreviouslyOwned = useCallback(() => {
    router.push("/(tabs)/(racks)/previously-owned");
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchRacks();
  }, [fetchRacks]);

  const renderHeader = useCallback(
    () => (
      <View className="flex flex-row justify-between items-center w-full mb-5 mt-8 px-3">
        <Text style={typography["title-bold"]} className="text-black text-5xl">Racks</Text>
        <TouchableOpacity onPress={handlePreviouslyOwned} className="pr-1">
          <ArchiveButton width={22} height={22} />
        </TouchableOpacity>
      </View>
    ),
    [handlePreviouslyOwned],
  );

  const renderRackItem = useCallback(
    ({ item }: { item: GetRackInfoDTO }) => (
      <RackItem
        rack={{
          ...item,
          onPress: () => handleCardPress(item.id),
          onMorePress: () => {},
        }}
      />
    ),
    [handleCardPress],
  );

  const renderFooter = useCallback(
    () => <AddRackButton onPress={handleAddRack} />,
    [handleAddRack],
  );

  if (!hasLoadedOnce.current && loading) {
    return (
      <SafeAreaView className="bg-white flex-1">
        <FlatList
          data={Array.from({ length: SKELETON_COUNT })}
          keyExtractor={(_, i) => `skeleton-${i}`}
          renderItem={() => <RackItemSkeleton />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          scrollEnabled={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white flex-1">
      <FlatList
        data={racks}
        renderItem={renderRackItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          error ? (
            <View className="flex-1 justify-center items-center py-20 gap-4">
              <Text style={typography["button-bold"]} className="text-grayText text-center">Something went wrong</Text>
              <TouchableOpacity onPress={handleRetry} className="bg-primary px-6 py-3 rounded-xl">
                <Text style={typography["button"]} className="text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#86975A" />}
      />

      {/* Tutorial Overlay - Now inside the RacksScreen component */}
      {currentTutorial && (
        <OnboardingTutorialModal
          visible={tutorialStep > 0}
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
    </SafeAreaView>
  );
}