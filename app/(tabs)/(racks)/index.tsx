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

const SKELETON_COUNT = 3;

export default function RacksScreen() {
  const [racks, setRacks] = useState<GetRackInfoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { refetch: getAllRacks } = useFetch("/api/racks", {
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
      setRacks([]);
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
        if (isScreenActive) {
          if (racks.length === 0) setLoading(true);
          await fetchRacks();
        }
      };

      loadData();

      return () => {
        isScreenActive = false;
      };
    }, [fetchRacks, racks.length]),
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
      <View className="flex flex-row justify-between items-center w-full mb-2 mt-8 pl-3">
        <Text
          style={typography["title-bold"]}
          className="text-black text-5xl mb-[20px]"
        >
          Racks
        </Text>
        <TouchableOpacity onPress={handlePreviouslyOwned}>
          <Text style={typography["button"]} className="text-primary">
            Previously Owned
          </Text>
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

  // ─── Content area based on state ───────────────────────────────────────────

  const isLoadingState = (loading || refreshing) && racks.length === 0;
  const isErrorState = !!error && racks.length === 0 && !isLoadingState;
  const isEmptyState = !loading && !error && racks.length === 0;

  if (isLoadingState) {
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
                style={typography["h2-bold"]}
                className="text-gray-400 text-center"
              >
                Something went wrong
              </Text>
              <Text
                style={typography["subheader"]}
                className="text-gray-400 text-center px-6"
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
