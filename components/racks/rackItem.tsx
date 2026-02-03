import { typography } from "@/assets/fonts/Text";
import { GetRackInfoDTO } from "@/types/rack.dto";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";

const LeafIcon = ({ size = 18, color = "#86975A" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={8} fill={color} />
  </Svg>
);

const DropletIcon = ({ size = 18, color = "#86975A" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={8} fill={color} />
  </Svg>
);

const WaveIcon = ({ size = 18, color = "#86975A" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={4} y={8} width={16} height={8} rx={2} fill={color} />
  </Svg>
);

const ThermometerIcon = ({ size = 18, color = "#F0A877" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={8} y={4} width={8} height={16} rx={4} fill={color} />
  </Svg>
);

const MoreIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={6} r={2} fill="#666" />
    <Circle cx={12} cy={12} r={2} fill="#666" />
    <Circle cx={12} cy={18} r={2} fill="#666" />
  </Svg>
);

interface RackItemProps {
  rack: GetRackInfoDTO;
}

const RackItem: React.FC<RackItemProps> = ({ rack }) => {
  const [isLoading, setIsLoading] = useState(false); // New anti-spam state!

  const {
    name,
    plant,
    image,
    leaves,
    water,
    humidity,
    temperature,
    hasAlert = false,
    onPress,
  } = rack;

  const handlePress = async () => {
    if (isLoading || !onPress) return;

    setIsLoading(true);
    try {
      await onPress();
    } finally {
      // Cooldown to ensure navigation or action finishes smoothly
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
      className={`bg-white rounded-2xl p-5 shadow-md border border-gray-100 w-full mb-5 ${
        isLoading ? "opacity-70" : ""
      }`}
      >
      <View className="flex-row justify-between items-center mb-7">
        <View className="flex-row items-center gap-5 flex-1">
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
            <View className="flex-row items-center gap-2 mb-1">
              <Text
                style={typography["h2-bold"]}
                className=" text-black"
                numberOfLines={1}
              >
                {name}
              </Text>
              {hasAlert && (
                <View className="w-2.5 h-2.5 rounded-full bg-[#FF2121]" />
              )}
            </View>
            <Text
              style={typography["subheader"]}
              className=" text-[#73883C]"
              numberOfLines={1}
            >
              {plant}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-center items-center w-full gap-10">
        <View className="flex-row items-center gap-1.5">
          <LeafIcon size={18} />
          <Text style={typography["label-bold"]} className="text-black">
            {leaves}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <DropletIcon size={18} />
          <Text style={typography["label-bold"]} className="text-black">
            {water.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <WaveIcon size={18} />
          <Text style={typography["label-bold"]} className="text-black">
            {humidity}%
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <ThermometerIcon size={18} />
          <Text style={typography["label-bold"]} className="text-black">
            {temperature}°C
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RackItem;
