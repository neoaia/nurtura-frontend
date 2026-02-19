import { typography } from "@/assets/fonts/Text";
import AddRackButton from "@/components/racks/addRackItemBtn";
import RackItem from "@/components/racks/rackItem";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService";
import { GetRackInfoDTO } from "@/types/rack.dto";
import { router, useFocusEffect } from "expo-router"; // ✅ ADDED useFocusEffect
import { useCallback, useState } from "react"; // ❌ REMOVED useEffect
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      // Optional: Pwede mong tanggalin to kung ayaw mo mag-flash yung loading spinner pagbalik
      // setLoading(true);
      setError(null);

      const response = await rackService.getAllUserRack(getAllRacks);

      if (response?.data) {
        const mappedRacks: GetRackInfoDTO[] = response.data.map((rack) => ({
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
      setError(err instanceof Error ? err.message : "Failed to load racks");
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

  // ✅ ITO ANG SOLUSYON: useFocusEffect
  // Tumatakbo ito every time na mag-focus ka sa screen na 'to
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        if (isActive) {
          // I-set natin loading true ONLY kung wala pang laman yung racks
          // para hindi nakakairita yung loading spinner pag may laman na
          if (racks.length === 0) setLoading(true);
          await fetchRacks();
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, [fetchRacks]), // Remove 'racks.length' dependency to avoid loop, just fetchRacks
  );

  const handleCardPress = useCallback((rackId: string) => {
    router.push(`/(tabs)/(racks)/${rackId}` as any);
  }, []);

  const handleAddRack = useCallback(() => {
    router.push("/(tabs)/(add_pages)/(addNewRack)");
  }, []);

  const renderHeader = useCallback(
    () => (
      <View className="flex justify-start items-start w-full mb-2 mt-8 pl-3">
        <Text
          style={typography["title-bold"]}
          className="text-black text-5xl mb-[20px]"
        >
          Racks
        </Text>
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

  const renderEmpty = useCallback(
    () => (
      <View className="flex-1 justify-center items-center py-20">
        <Text style={typography["h2-bold"]} className="text-gray-400 mb-2">
          No racks yet
        </Text>
        <Text style={typography["subheader"]} className="text-gray-400">
          Add your first rack to get started
        </Text>
      </View>
    ),
    [],
  );

  const renderFooter = useCallback(
    () => <AddRackButton onPress={handleAddRack} />,
    [handleAddRack],
  );

  // Check kung loading AND walang data para hindi mawala yung UI habang nagrerefresh
  if (loading && !refreshing && racks.length === 0) {
    return (
      <SafeAreaView className="bg-white flex-1">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#86975A" />
          <Text style={typography["button"]} className="text-grayText mt-4">
            Loading racks...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && racks.length === 0) {
    return (
      <SafeAreaView className="bg-white flex-1">
        <View className="flex-1 justify-center items-center px-6">
          <Text style={typography["h2-bold"]} className="text-red-500 mb-4">
            Error Loading Racks
          </Text>
          <Text
            style={typography["subheader"]}
            className="text-gray-600 mb-6 text-center"
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchRacks}
            className="bg-primary px-6 py-3 rounded-xl"
            activeOpacity={0.8}
          >
            <Text style={typography["button"]} className="text-white">
              Retry
            </Text>
          </TouchableOpacity>
        </View>
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
        ListEmptyComponent={renderEmpty}
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
