import { typography } from "@/assets/fonts/Text";
import { YieldInputModal } from "@/components/modals/yieldInputModal";
import PlantStatusIndicators from "@/components/racks/plantStatusIndicators";
import { BottomButton } from "@/components/shared/bottomButton";
import { MenuCard } from "@/components/shared/menubtn";
import SmallDescription from "@/components/shared/smallDescription";
import React, { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import DateIcon from "../../../../assets/images/icons/date.svg";
import SoilIcon from "../../../../assets/images/icons/soil.svg";

const RackInfo = () => {
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (val: number) => {
    console.log("Final Yield:", val);
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="bg-white px-4 py-4"
        >
          {/*temporary lang yung pl-8 para magitna lang si litus nyahaha*/}
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
              route="/(tabs)/(racks)/[rackId]/care"
            />

            <MenuCard
              title="Harvest Activity"
              description="Records of your past harvests for this plant."
              iconSource={require("@/assets/images/harvest-icon.png")}
              route="/(tabs)/(racks)/[rackId]/harvest-history"
            />
          </View>
        </ScrollView>
        <BottomButton title="Mark as Harvested" onPress={handleHarvestPress} />
      </View>

      <YieldInputModal
        isVisible={showModal}
        title="Record Harvest"
        onConfirm={(val) => {
          handleSubmit(val);
        }}
        onCancel={handleCancel}
      />
    </>
  );
};

export default RackInfo;
