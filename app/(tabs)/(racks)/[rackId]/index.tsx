import { typography } from "@/assets/fonts/Text";
import { YieldInputModal } from "@/components/modals/yieldInputModal";
import PlantStatusIndicators from "@/components/racks/plantStatusIndicators";
import { BottomButton } from "@/components/shared/bottomButton";
import { MenuCard } from "@/components/shared/menubtn";
import SmallDescription from "@/components/shared/smallDescription";
import useFetch from "@/hooks/useFetch";
import { useRackSensor } from "@/hooks/useRackSensor";
import { rackService } from "@/services/rackService";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import DateIcon from "../../../../assets/images/icons/date.svg";
import SoilIcon from "../../../../assets/images/icons/soil.svg";

const RackInfo = () => {
  const { rackId } = useLocalSearchParams<{ rackId: string }>();
  const [showModal, setShowModal] = useState(false);
  const [rackData, setRackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { reading } = useRackSensor(rackId);

  const { refetch: getRackInfo } = useFetch(`/api/racks/${rackId}`, {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchRackData = async () => {
        try {
          if (isActive) setLoading(true);
          const response = await rackService.getRackbyId(getRackInfo);
          if (isActive && response?.rack) {
            setRackData(response.rack);
          }
        } catch (err) {
        } finally {
          if (isActive) setLoading(false);
        }
      };

      if (rackId) {
        fetchRackData();
      }

      return () => {
        isActive = false;
      };
    }, [rackId]),
  );

  const handleSubmit = useCallback((val: number) => {
    setShowModal(false);
  }, []);

  const handleCancel = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleHarvestPress = useCallback(() => {
    setShowModal(true);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#86975A" />
        <Text style={typography["subheader"]} className="text-gray-500 mt-4">
          Loading rack information...
        </Text>
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 bg-white">
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="bg-white px-4 py-4"
        >
          <View className="flex-1 justify-center items-center pl-8">
            <Image
              source={require("@/assets/images/plant-images/lettuce.png")}
              className="w-72 h-72"
              resizeMode="contain"
            />
          </View>

          <View className="w-full flex-row justify-between items-start mb-6">
            <View className="flex-1 pl-2">
              <Text style={typography["h1-bold"]} className="text-black">
                {rackData?.name || "Rack"}
              </Text>
              <Text style={typography["subheader"]} className="text-grayText">
                {rackData?.description || "No description"}
              </Text>
            </View>
            <View className="items-end pr-2">
              <Text style={typography["h1-bold"]} className="text-black">
                3
              </Text>
              <Text style={typography["subheader"]} className="text-grayText">
                Seeds
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3 mb-6">
            {reading === null ? (
              <View className="flex-1 items-center justify-center py-8 bg-gray-50 rounded-lg">
                <ActivityIndicator size="large" color="#86975A" />
                <Text
                  style={typography["subheader"]}
                  className="text-gray-500 mt-3"
                >
                  Connecting to sensors...
                </Text>
              </View>
            ) : (
              <>
                <PlantStatusIndicators
                  type="temperature"
                  value={reading.temperature}
                />
                <PlantStatusIndicators
                  type="humidity"
                  value={reading.humidity}
                />
                <PlantStatusIndicators
                  type="soil-moisture"
                  value={reading.moisture}
                />
              </>
            )}
          </View>

          <View className="flex-col gap-8 mt-6 mb-8 pl-2">
            <SmallDescription
              label="Date Planted"
              value="July 23, 2025"
              Icon={DateIcon}
            />
            <SmallDescription
              label="Recommended Soil"
              value="Loam + Compost + Perlite"
              Icon={SoilIcon}
            />
          </View>

          <View className="flex-col gap-3 mb-8">
            <MenuCard
              title="Plant Care Activity"
              description="Logs based on watering and grow light activity."
              iconSource={require("@/assets/images/plantcare-icon.png")}
              route="/(tabs)/(racks)/care"
            />

            <MenuCard
              title="Harvest Activity"
              description="Records of your past harvests for this plant."
              iconSource={require("@/assets/images/harvest-icon.png")}
              route="/(tabs)/(racks)/harvest-history"
            />
          </View>
        </ScrollView>

        <BottomButton title="Mark as Harvested" onPress={handleHarvestPress} />
      </View>

      <YieldInputModal
        isVisible={showModal}
        title="Record Harvest"
        onConfirm={handleSubmit}
        onCancel={handleCancel}
      />
    </>
  );
};

export default RackInfo;
