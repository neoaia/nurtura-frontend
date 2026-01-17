import React from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";

interface HarvestItemProps {
  plantName: string;
  rackName: string;
  time: string;
  weight: string;
  plantImage: ImageSourcePropType;
}

export const HarvestItem: React.FC<HarvestItemProps> = ({ 
  plantName, 
  rackName, 
  time, 
  weight, 
  plantImage 
}) => {
  return (
    <View className="bg-white rounded-[14px] p-4 flex-row items-center shadow-md elevation-3 my-2">
      
      <View className="w-[90px] h-[90px] bg-[#e9f2d9] rounded-[18px] justify-center items-center">
        <Image source={plantImage} className="w-[90px] h-[90px]" resizeMode="contain" />
      </View>

      
      <View className="flex-1 ml-6" style={{ gap: 24 }}>
        <View style={{ gap: 4 }}>
          <Text className="text-[14px] font-bold text-[#86975A]">{plantName}</Text>
          <Text className="text-[14px] text-[#919191] font-medium">at {rackName}</Text>
        </View>

        
        <View className="flex-row mr-8" style={{ gap: 64 }}>
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Image 
              source={require("@/assets/images/plant-time-icon.png")} 
              className="w-[16px] h-[16px]" 
              style={{ tintColor: "#7a904a" }}
              resizeMode="contain"
            />
            <Text className="text-[12px] text-[#919191] font-medium">{time}</Text>
          </View>

          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Image 
              source={require("@/assets/images/harvest-icon.png")} 
              className="w-[16px] h-[16px]" 
              style={{ tintColor: "#7a904a" }}
              resizeMode="contain"
            />
            <Text className="text-[12px] text-[#919191] font-medium">{weight}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};