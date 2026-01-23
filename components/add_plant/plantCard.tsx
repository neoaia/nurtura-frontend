import { typography } from "@/assets/fonts/Text";
import React from "react";
import {
    Image,
    ImageSourcePropType,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface PlantCardProps {
  plantName: string;
  category: string;
  image?: ImageSourcePropType;
  onPress: () => void;
  isSelected?: boolean;
}

const PlantCard = ({
  plantName,
  category,
  image,
  onPress,
  isSelected,
}: PlantCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="w-[48%] mb-5"
    >
      {/* Plant Image Container with conditional border */}
      <View
        className={`w-full aspect-square bg-[#E5EDCF] rounded-2xl items-center justify-center mb-3 p-4 ${
          isSelected ? "border-4 border-primary" : ""
        }`}
      >
        {image ? (
          <Image
            source={image}
            className="w-full h-full"
            resizeMode="contain"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-4xl"></Text>
          </View>
        )}
      </View>

      {/* Plant Name */}
      <Text style={typography["subheader-bold"]} className="text-black">
        {plantName}
      </Text>

      {/* Category */}
      <Text style={typography["subheader"]} className="text-gray-600">
        {category}
      </Text>
    </TouchableOpacity>
  );
};

export default PlantCard;
