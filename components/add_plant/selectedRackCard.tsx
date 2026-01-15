import React from "react";
import { Text, View } from "react-native";

interface SelectedRackCardProps {
  rackName: string;
}

const SelectedRackCard: React.FC<SelectedRackCardProps> = ({ rackName }) => {
  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-full">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-4 flex-1">
          <View className="w-14 h-14 bg-[#E5EDCF] rounded-xl items-center justify-center" />

          <View className="flex-1">
            <Text className="text-lg font-bold text-black mb-1">
              {rackName}
            </Text>
            <Text className="text-sm text-grayText">Selected Rack</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SelectedRackCard;
