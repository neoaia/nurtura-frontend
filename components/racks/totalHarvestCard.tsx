import React from "react";
import { Image, Text, View } from "react-native";

interface TotalHarvestCardProps {
  totalGrams: number;
  sinceDate: string;
  image?: string;
}

const TotalHarvestCard: React.FC<TotalHarvestCardProps> = ({
  totalGrams,
  sinceDate,
  image,
}) => {
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
            <Text className="text-lg font-bold text-black mb-1">
              Total Harvest
            </Text>
            <Text className="text-sm text-grayText">since {sinceDate}</Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-2xl font-bold text-black">{totalGrams}</Text>
          <Text className="text-sm text-grayText mt-1">grams</Text>
        </View>
      </View>
    </View>
  );
};

export default TotalHarvestCard;
