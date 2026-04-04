import { typography } from "@/assets/fonts/Text";
import AddRackButton from "@/components/racks/addRackItemBtn";
import RackItem from "@/components/racks/rackItem";
import RackItemSkeleton from "@/components/racks/skeleton/rackItemSkeleton";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService";
import { GetRackInfoDTO } from "@/types/rack.dto";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
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
      // Don't clear existing racks on refresh failure — keep stale data visible
      setRacks((prev) => prev);
    } finally {
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
      let isScreenActive = true;

      const loadData = async () => {
        if (!isScreenActive) return;
        // Only show skeleton on first ever load (no cached racks yet)
        if (racks.length === 0) setLoading(true);
        await fetchRacks();
      };

      loadData();

      return () => {
        isScreenActive = false;
      };
    }, [fetchRacks]),
    // Removed `racks.length` from deps — it was causing fetchRacks to re-register
    // every time a rack was added, leading to duplicate calls
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
  //   1. If we have racks → show them immediately (websocket connects in background)
  //   2. If still on first load (no racks yet) → skeleton
  //   3. If fetch failed with no racks → error state
  //   4. If fetch succeeded but no active racks → empty state

  const hasRacks = racks.length > 0;
  const isFirstLoad = loading && !hasRacks;
  const isErrorState = !!error && !hasRacks && !isFirstLoad;
  const isEmptyState = !loading && !error && !hasRacks;

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
