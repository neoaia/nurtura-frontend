import { typography } from "@/assets/fonts/Text";
import AddRackButton from "@/components/racks/addRackItemBtn";
import RackItem from "@/components/racks/rackItem";
import useFetch from "@/hooks/useFetch";
import { GetRackInfoDTO } from "@/types/rack.dto";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RacksScreen() {
  const [racks, setRacks] = useState<GetRackInfoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  //#region TEMPORARY SERVICE/HOOK
  const { refetch: getAllRacks } = useFetch("/api/racks", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const fetchRacks = async () => {
    try {
      setLoading(true);

      // TODO: Replace with real API call, mock data for now
      const mockRacks: GetRackInfoDTO[] = [
        {
          id: "1",
          name: "Living Room Rack",
          plant: "Lettuce",
          image: undefined,
          leaves: 12,
          water: 1.5,
          humidity: 60,
          temperature: 22,
          hasAlert: true,
        },
        {
          id: "2",
          name: "Kitchen Garden",
          plant: "Basil",
          image: undefined,
          leaves: 8,
          water: 2.1,
          humidity: 65,
          temperature: 24,
          hasAlert: false,
        },
        {
          id: "3",
          name: "Balcony Setup",
          plant: "Tomato",
          image: undefined,
          leaves: 15,
          water: 3.2,
          humidity: 58,
          temperature: 26,
          hasAlert: true,
        },
      ];

      setRacks(mockRacks);
    } catch (error) {
      console.error("Failed to fetch racks:", error);
    } finally {
      setLoading(false);
    }
  };
  //#endregion

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

  // header renderer
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

  // rack item renderer
  const renderRackItem = ({ item }: { item: GetRackInfoDTO }) => (
    <RackItem
      rack={{
        ...item,
        onPress: () => handleCardPress(item.id),
        onMorePress: () => console.log("More pressed:", item.id),
      }}
    />
  );

  // footer renderer
  const renderFooter = () => <AddRackButton onPress={handleAddRack} />;

  if (loading) {
    return (
      <SafeAreaView className="bg-white flex-1">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
          <Text style={typography["button"]} className="text-grayText mt-4">
            Loading racks...
          </Text>
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
        // ListEmptyComponent={renderEmpty}
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
            tintColor="#000"
          />
        }
      />
    </SafeAreaView>
  );
}
