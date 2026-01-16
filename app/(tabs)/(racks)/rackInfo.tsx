import PlantStatusIndicators from "@/components/racks/plantStatusIndicators";
import SmallDescription from "@/components/shared/smallDescription";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const rackInfo = () => {
  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4 bg-white">
          <View className="w-full flex-row justify-between items-start mb-6">
            <View className="flex-1 pl-2">
              <Text className="text-2xl font-bold text-black">Lettuce</Text>
              <Text className="text-sm text-grayText">Fruit Vegetable</Text>
            </View>
            <View className="items-end pr-2">
              <Text className="text-2xl font-bold text-black">3</Text>
              <Text className="text-sm text-grayText">Seeds</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <PlantStatusIndicators type="temperature" value="22°C" />
            <PlantStatusIndicators type="humidity" value="60%" />
            <PlantStatusIndicators type="soil-moisture" value="40%" />
          </View>

          <View className="flex-col gap-8 mt-6 mb-8">
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default rackInfo;
