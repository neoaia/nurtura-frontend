import { typography } from "@/assets/fonts/Text";
import AddRackButton from "@/components/racks/addRackItemBtn";
import RackItem from "@/components/racks/rackItem";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService";
import { GetRackInfoDTO } from "@/types/rack.dto";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

  const fetchRacks = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Use real API
      const response = await rackService.getAllUserRack(getAllRacks);

      if (response?.data) {
        // ✅ Map API response to GetRackInfoDTO format
        const mappedRacks: GetRackInfoDTO[] = response.data.map((rack) => ({
          id: rack.id,
          name: rack.name,
          plant: "Lettuce", // ❌ Not in API, using default
          image: undefined,
          seeds: 12, // ❌ Not in API, using default
          water: 0, // Will be populated by useRackSensor in RackItem
          humidity: 0, // Will be populated by useRackSensor in RackItem
          temperature: 0, // Will be populated by useRackSensor in RackItem
          hasAlert: rack.status === "offline" || rack.status === "error",
        }));

        setRacks(mappedRacks);
      } else {
        setRacks([]);
      }
    } catch (err) {
      console.error("Failed to fetch racks:", err);
      setError(err instanceof Error ? err.message : "Failed to load racks");
      setRacks([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRacks();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchRacks();
  }, []);

  const handleCardPress = (rackId: string) => {
    console.log("Card clicked!", rackId);
    router.push(`/(tabs)/(racks)/${rackId}` as any);
  };

  const handleAddRack = () => {
    router.push("/(tabs)/(add_pages)/(addNewRack)");
  };

  const renderHeader = () => (
    <View className="flex justify-start items-start w-full mb-2 mt-8 pl-3">
      <Text
        style={typography["title-bold"]}
        className="text-black text-5xl mb-[20px]"
      >
        Racks
      </Text>
    </View>
  );

  const renderRackItem = ({
    item,
    index,
  }: {
    item: GetRackInfoDTO;
    index: number;
  }) => (
    <RackItem
      rack={{
        ...item,
        onPress: () => handleCardPress(item.id),
        onMorePress: () => console.log("More pressed:", item.id),
      }}
    />
  );

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Text style={typography["h2-bold"]} className="text-gray-400 mb-2">
        No racks yet
      </Text>
      <Text style={typography["subheader"]} className="text-gray-400">
        Add your first rack to get started
      </Text>
    </View>
  );

  const renderFooter = () => <AddRackButton onPress={handleAddRack} />;

  if (loading) {
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

  if (error) {
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
        keyExtractor={(item, index) => `${item.id}-${index}`}
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
