import { typography } from "@/assets/fonts/Text";
import { TotalHarvestDTO } from "@/types/rack.dto";
import React from "react";
import { Image, Text, View } from "react-native";

interface TotalHarvestCardProps {
  harvest: TotalHarvestDTO;
}

const TotalHarvestCard: React.FC<TotalHarvestCardProps> = ({ harvest }) => {
  const { totalGrams = 0, sinceDate = "-", image } = harvest;

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-full">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-4 flex-1">
          <View className="w-14 h-14 bg-[#E5EDCF] rounded-xl items-center justify-center">
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-12 h-12"
                resizeMode="contain"
              />
            ) : (
              <Text className="text-3xl"></Text>
            )}
          </View>

          <View className="flex-1">
            <Text style={typography["h2-bold"]} className="text-black mb-2">
              Total Harvest
            </Text>
            <Text style={typography["subheader"]} className="text-grayText">
              since {sinceDate}
            </Text>
          </View>
        </View>

        <View className="items-center">
          <Text style={typography["title-2 bold"]} className="text-black">
            {totalGrams}
          </Text>
          <Text style={typography["subheader"]} className="text-grayText">
            grams
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TotalHarvestCard;
