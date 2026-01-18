import { typography } from "@/assets/fonts/Text";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import Dropdown from "../shared/dropdown";

const CloseIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke="#fff"
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  </Svg>
);

interface PlantDetailHeaderProps {
  plantName: string;
  plantType: string;
  onClose?: () => void;
}

const PlantDetailHeader: React.FC<PlantDetailHeaderProps> = ({
  plantName,
  plantType,
  onClose,
}) => {
  return (
    <View className="w-full">
      <View className="w-full items-center justify-start flex-row gap-5">
        <View className="relative">
          <View
            className="bg-[#E5EDCF] rounded-xl items-center justify-center flex-shrink-0"
            style={{ width: 128, height: 128 }}
          />

          <TouchableOpacity
            onPress={onClose}
            className="absolute -top-2 -left-2 w-8 h-8 bg-[#d45757] rounded-full items-center justify-center shadow-md z-10"
            activeOpacity={0.8}
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <View className="mb-2">
            <Text style={typography["h2-bold"]} className="text-black   mb-1">
              {plantName}
            </Text>
            <Text style={typography["subheader"]} className=" text-grayText mb-2">
              {plantType}
            </Text>
          </View>
          <Dropdown />
        </View>
      </View>
    </View>
  );
};

export default PlantDetailHeader;
