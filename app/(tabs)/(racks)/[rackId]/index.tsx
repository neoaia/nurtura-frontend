import { typography } from "@/assets/fonts/Text";
import PlantCareIcon from "@/assets/images/icons/plantCare(Activity).svg";
import PlantIcon from "@/assets/images/icons/plants(Dashboard).svg";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import PlantStatusIndicators from "@/components/racks/plantStatusIndicators";
import { PlantStatusIndicatorsSkeleton } from "@/components/racks/skeleton/plantStatusIndicatorsSkeleton";
import { BottomButton } from "@/components/shared/bottomButton";
import { MenuCard } from "@/components/shared/menubtn";
import { MenuCardSkeleton } from "@/components/shared/skeleton/menuCardSkeleton";
import { SmallDescriptionSkeleton } from "@/components/shared/skeleton/smallDescriptionSkeleton";
import SmallDescription from "@/components/shared/smallDescription";
import useFetch from "@/hooks/useFetch";
import { useRackSensor } from "@/hooks/useRackSensor";
import { rackService } from "@/services/rackService";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
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

      if (rackId) fetchRackData();

      return () => {
        isActive = false;
      };
    }, [rackId]),
  );

  const handleSubmit = useCallback(() => setShowModal(false), []);
  const handleCancel = useCallback(() => setShowModal(false), []);
  const handleHarvestPress = useCallback(() => setShowModal(true), []);

  return (
    <>
      <View className="flex-1 bg-white">
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="bg-white px-4 py-4"
        >
          {/* Plant image — always visible */}
          <View className="flex-1 justify-center items-center pl-8">
            <Image
              source={require("@/assets/images/plant-images/lettuce.png")}
              className="w-72 h-72"
              resizeMode="contain"
            />
          </View>

          {/* Plant name + seeds */}
          {loading ? (
            <View className="w-full flex-row justify-between items-start mb-6 px-2 gap-4">
              <View className="flex-1 gap-2">
                <SkimmerLine width="55%" height={24} />
                <SkimmerLine width="35%" height={14} />
              </View>
              <View className="items-end gap-2">
                <SkimmerLine width={32} height={24} />
                <SkimmerLine width={40} height={14} />
              </View>
            </View>
          ) : (
            <View className="w-full flex-row justify-between items-start mb-6">
              <View className="flex-1 pl-2">
                <Text style={typography["h1-bold"]} className="text-black">
                  Lettuce
                </Text>
                <Text style={typography["subheader"]} className="text-grayText">
                  Leafy Greens
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
          )}

          {/* Sensor indicators — skeleton while loading OR while connecting to socket */}
          <View className="flex-row gap-3 mb-6">
            {loading || reading === null ? (
              <>
                <PlantStatusIndicatorsSkeleton />
                <PlantStatusIndicatorsSkeleton />
                <PlantStatusIndicatorsSkeleton />
              </>
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

          {/* Small descriptions */}
          <View className="flex-col gap-8 mt-6 mb-8 pl-2">
            {loading ? (
              <>
                <SmallDescriptionSkeleton />
                <SmallDescriptionSkeleton />
              </>
            ) : (
              <>
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
              </>
            )}
          </View>

          {/* Menu cards */}
          <View className="flex-col gap-3 mb-8">
            {loading ? (
              <>
                <MenuCardSkeleton />
                <MenuCardSkeleton />
              </>
            ) : (
              <>
                <MenuCard
                  title="Plant Care Activity"
                  description="Logs based on watering and grow light activity."
                  icon={PlantCareIcon}
                  iconSize={25}
                  route="/(tabs)/(racks)/care"
                />
                <MenuCard
                  title="Harvest Activity"
                  description="Records of your past harvests for this plant."
                  icon={PlantIcon}
                  route="/(tabs)/(racks)/harvest-history"
                />
              </>
            )}
          </View>
        </ScrollView>

        <BottomButton title="Mark as Harvested" onPress={handleHarvestPress} />
      </View>

      <ConfirmationModal
        isVisible={showModal}
        title="Record Harvest?"
        message="This will be recorded on your activity."
        onCancel={handleCancel}
        onConfirm={handleSubmit}
      />
    </>
  );
};

// Small inline helper for the name/seeds shimmer rows
// (too simple to warrant a separate file)
const SkimmerLine = ({
  width,
  height,
}: {
  width: number | string;
  height: number;
}) => (
  <View
    style={{
      width: width as any,
      height,
      borderRadius: 6,
      backgroundColor: "#e0e0e0",
    }}
  />
);

export default RackInfo;
