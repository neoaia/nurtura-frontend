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
    <View className="bg-white rounded-2xl p-4 flex-row items-center shadow-md border-gray-100 elevation-3 my-2">
      
      <View className=" bg-[#e9f2d9] rounded-2xl justify-center items-center">
        <Image source={plantImage} className="w-[90px] h-[90px]" resizeMode="contain" />
      </View>

      
      <View className="ml-5 flex-1 gap-5">
        <View style={{ gap: 4 }}>
          <Text className="text-sm font-bold text-primary">{plantName}</Text>
          <Text className="text-sm text-[#919191]">at {rackName}</Text>
        </View>

        
        <View className="flex-row mr-8" style={{ gap: 56 }}>
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Image 
              source={require("@/assets/images/plant-time-icon.png")} 
              className="w-[16px] h-[16px]" 
              style={{ tintColor: "#7a904a" }}
              resizeMode="contain"
            />
            <Text className="text-sm text-grayText">{time}</Text>
          </View>

          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Image 
              source={require("@/assets/images/harvest-icon.png")} 
              className="w-[16px] h-[16px]" 
              style={{ tintColor: "#7a904a" }}
              resizeMode="contain"
            />
            <Text className="text-sm text-grayText">{weight}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};