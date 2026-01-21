import { typography } from "@/assets/fonts/Text";
import { YieldInputModal } from "@/components/modals/yieldInputModal";
import PlantStatusIndicators from "@/components/racks/plantStatusIndicators";
import { BottomButton } from "@/components/shared/bottomButton";
import { MenuCard } from "@/components/shared/menubtn";
import SmallDescription from "@/components/shared/smallDescription";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";

const RackInfo = () => {
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = () => {
    console.log("Submitted!");
    setShowModal(false);
  };

  const handleCancel = () => {
    console.log("Cancelled");
    setShowModal(false);
  };
  const handleHarvestPress = () => {
    console.log("Harvest button pressed");
    setShowModal(true);
  };
  return (
    <>
      <View className="flex-1 bg-white">
        <ScrollView showsVerticalScrollIndicator={false} className="bg-white">
          <View className="px-4 py-4 bg-white">
            <View className="w-full flex-row justify-between items-start mb-6">
              <View className="flex-1 pl-2">
                <Text style={typography["h1-bold"]} className="text-black">
                  Lettuce
                </Text>
                <Text style={typography["subheader"]} className="text-grayText">
                  Fruit Vegetable
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

            <View className="flex-row gap-3">
              <PlantStatusIndicators type="temperature" value="22°C" />
              <PlantStatusIndicators type="humidity" value="60%" />
              <PlantStatusIndicators type="soil-moisture" value="40%" />
            </View>

            <View className="flex-col gap-8 mt-6 mb-8 pl-2">
              <SmallDescription label="Date Planted" value="July 23, 2025" />
              <SmallDescription
                label="Recommended Soil"
                value="Loam + Compost + Perlite"
              />
              <SmallDescription
                label="Estimated Yield (per seed)"
                value="150-500 grams"
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
                route="/(tabs)/(racks)/harvestHistory"
              />
            </View>
          </View>
        </ScrollView>
        <BottomButton title="Mark as Harvested" onPress={handleHarvestPress} />
      </View>

      <YieldInputModal
        isVisible={showModal}
        title="Record Harvest"
        onConfirm={(val) => {
          console.log("Final Yield:", val);
          setShowModal(false);
        }}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
};

export default RackInfo;
