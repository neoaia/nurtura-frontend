import { typography } from "@/assets/fonts/Text";
import InactiveRackItem from "@/components/racks/inactiveRackItem";
import RackItemSkeleton from "@/components/racks/skeleton/rackItemSkeleton";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService";
import { GetRackInfoDTO } from "@/types/rack.dto";
import { router, useFocusEffect } from "expo-router";

import React, { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";

const SKELETON_COUNT = 3;

type InactiveRackType = GetRackInfoDTO & {
  createdAt?: string;
  updatedAt?: string;
};

const PreviouslyOwned = () => {
  const [racks, setRacks] = useState<InactiveRackType[]>([]);
  const [loading, setLoading] = useState(true);

  const { refetch: getAllRacks } = useFetch("/racks", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const fetchRacks = useCallback(async () => {
    try {
      const response = await rackService.getAllUserRack(getAllRacks);

      if (response?.data) {
        const mappedRacks: InactiveRackType[] = response.data
          .filter((rack: any) => rack.isActive == false || rack.isActive == 0)
          .map((rack: any) => ({
            id: rack.id,
            name: rack.name,
            plant: "Sample",
            image: undefined,
            seeds: 12,
            water: 0,
            humidity: 0,
            temperature: 0,
            hasAlert: false,
            createdAt: rack.createdAt,
            updatedAt: rack.updatedAt,
          }));

        setRacks(mappedRacks);
      } else {
        setRacks([]);
      }
    } catch (err) {
      setRacks([]);
    } finally {
      setLoading(false);
    }
  }, [getAllRacks]);

  useFocusEffect(
    useCallback(() => {
      let isScreenActive = true;

      const loadData = async () => {
        if (isScreenActive) {
          setLoading(true);
          await fetchRacks();
        }
      };

      loadData();

      return () => {
        isScreenActive = false;
      };
    }, [fetchRacks]),
  );

  const handleCardPress = useCallback((rackId: string) => {
    router.push(`/(tabs)/(racks)/${rackId}` as any);
  }, []);

  const renderRackItem = useCallback(
    ({ item }: { item: InactiveRackType }) => (
      <InactiveRackItem
        rack={{
          ...item,
          onPress: () => handleCardPress(item.id),
        }}
      />
    ),
    [handleCardPress],
  );

  const renderEmpty = useCallback(
    () => (
      <View className="flex-1 justify-center items-center py-20">
        <Text style={typography["button-bold"]} className="text-grayText mb-2">
          No previously owned racks
        </Text>
      </View>
    ),
    [],
  );

  return (
    <View className="flex-1 bg-white">
      {loading ? (
        <View className="px-4 pt-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <RackItemSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={racks}
          renderItem={renderRackItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default PreviouslyOwned;
