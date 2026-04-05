import { typography } from "@/assets/fonts/Text";
import AddRackButton from "@/components/racks/addRackItemBtn";
import RackItem from "@/components/racks/rackItem";
import RackItemSkeleton from "@/components/racks/skeleton/rackItemSkeleton";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService";
import { GetRackInfoDTO } from "@/types/rack.dto";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ArchiveButton from "../../../assets/buttons/archive.svg";

const SKELETON_COUNT = 3;

export default function RacksScreen() {
  const [racks, setRacks] = useState<GetRackInfoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Once we've completed at least one fetch, skeleton never shows again.
  // Re-focus refreshes run silently in the background — stale racks stay
  // visible instantly while new data loads behind them.
  const hasLoadedOnce = useRef(false);

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
            plant: "Lettuce",
            image: undefined,
            seeds: 12,
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
      const message =
        err instanceof Error ? err.message : "Failed to load racks";
      setError(message);
      // Keep stale racks visible on refresh failure
      setRacks((prev) => prev);
    } finally {
      // Mark that we've been through at least one full fetch cycle.
      // After this point, loading=true will never trigger the skeleton again.
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
      const loadData = async () => {
        // First ever load: show skeleton while fetching
        // Subsequent focuses: fetch silently, existing racks stay on screen
        if (!hasLoadedOnce.current) {
          setLoading(true);
        }
        await fetchRacks();
      };

      loadData();
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

  // ─── Sub-components ────────────────────────────────────────────────────────

  const renderHeader = useCallback(
    () => (
      <View className="flex flex-row justify-between items-center w-full mb-5 mt-8 px-3">
        <Text style={typography["title-bold"]} className="text-black text-5xl">
          Racks
        </Text>

        <TouchableOpacity onPress={handlePreviouslyOwned} className="pr-1">
          <ArchiveButton width={22} height={22} />
        </TouchableOpacity>
      </View>
    ),
    [],
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

  // ─── Render logic ──────────────────────────────────────────────────────────
  //
  // Priority order:
  //   1. If we have racks → show them immediately (even while a bg refresh runs)
  //   2. If still on very first load (hasLoadedOnce = false) → skeleton
  //   3. If fetch failed with no racks → error state
  //   4. If fetch succeeded but no active racks → empty state

  const hasRacks = racks.length > 0;
  const isFirstLoad = !hasLoadedOnce.current && loading;
  const isErrorState = !!error && !hasRacks && !isFirstLoad;
  const isEmptyState = hasLoadedOnce.current && !loading && !error && !hasRacks;

  if (isFirstLoad) {
    return (
      <SafeAreaView className="bg-white flex-1">
        <FlatList
          data={Array.from({ length: SKELETON_COUNT })}
          keyExtractor={(_, i) => `skeleton-${i}`}
          renderItem={() => <RackItemSkeleton />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </SafeAreaView>
    );
  }

  if (isErrorState) {
    return (
      <SafeAreaView className="bg-white flex-1">
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20 gap-4">
              <Text
                style={typography["button-bold"]}
                className="text-grayText text-center"
              >
                Something went wrong
              </Text>
              <Text
                style={typography["subheader"]}
                className="text-grayText text-center px-6"
              >
                {error}
              </Text>
              <TouchableOpacity
                onPress={handleRetry}
                className="bg-primary px-6 py-3 rounded-xl mt-2"
                activeOpacity={0.8}
              >
                <Text style={typography["button"]} className="text-white">
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  if (isEmptyState) {
    return (
      <SafeAreaView className="bg-white flex-1">
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={null}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  // ── Main list — renders as soon as racks data arrives ──────────────────────
  return (
    <SafeAreaView className="bg-white flex-1">
      <FlatList
        data={racks}
        renderItem={renderRackItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#86975A"
          />
        }
      />
    </SafeAreaView>
  );
}
