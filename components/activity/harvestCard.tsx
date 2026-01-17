import React from "react";
import { Image, Text, View } from "react-native";

interface SummaryCardProps {
  value: string | number;
  unit: string;
  label: string;
}

export const HarvestSummaryCard: React.FC<SummaryCardProps> = ({ value, unit, label }) => {
  return (
    <View className="bg-white rounded-[16px] p-5 w-[200px] shadow-lg elevation-4" style={{ gap: 8 }}>
      <View className="flex-row justify-between items-start mb-[15px]">
        <View className="bg-[#E5EDCF] p-[10px] rounded-[12px]">
          <Image 
            source={require("@/assets/images/harvest-icon.png")} 
            className="w-6 h-6"
            style={{ tintColor: "#7a904a" }}
            resizeMode="contain"
          />
        </View>
        
        <Text className="text-[38px] font-bold text-[#333] -mt-[3px]">
          {value}
        </Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text className="text-[18px] font-bold text-[#333]">{unit}</Text>
        <Text className="text-[14px] text-[#86975A] font-medium">{label}</Text>
      </View>
    </View>
  );
};