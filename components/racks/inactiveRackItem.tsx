import { typography } from "@/assets/fonts/Text";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { GetRackInfoDTO } from "@/types/rack.dto";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";

interface RackItemProps {
  rack: GetRackInfoDTO & { createdAt?: string; updatedAt?: string }; // In-update ko yung type in case di pa nakalagay sa DTO mo
}

const InactiveRackItem: React.FC<RackItemProps> = ({ rack }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Kinuha na natin yung createdAt at updatedAt galing sa payload
  const {
    id,
    name,
    plant,
    image,
    hasAlert = false,
    onPress,
    createdAt,
    updatedAt,
  } = rack;

  const handlePress = async () => {
    if (isLoading || !onPress) return;

    setIsLoading(true);
    try {
      await onPress();
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  // Helper function para maging human-readable yung date (ex: "Feb 18, 2026")
  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <DebouncedTouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
      className={`bg-white rounded-2xl py-6 px-5 shadow-md border border-gray-100 w-full mb-5 ${
        isLoading ? "opacity-70" : ""
      }`}
    >
      <View className="flex-row justify-between items-center mb-4">
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
                style={typography["button-bold"]}
                className="text-black"
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
              className="text-[#73883C]"
              numberOfLines={1}
            >
              Last Plant: {plant || "Sample"}
            </Text>
          </View>
        </View>
      </View>

      {/* Dito pumasok yung Created at Updated dates imbes na Sensors */}
      <View className="flex-row justify-between items-center w-full pt-4 border-t border-gray-100 mt-2 px-1">
        <View className="flex-col">
          <Text style={typography["subheader"]} className="text-gray-400 mb-1">
            Date Created
          </Text>
          <Text style={typography["subheader-bold"]} className="text-black">
            {formatDate(createdAt)}
          </Text>
        </View>

        <View className="flex-col items-end">
          <Text style={typography["subheader"]} className="text-gray-400 mb-1">
            Removed
          </Text>
          <Text style={typography["subheader-bold"]} className="text-black">
            {formatDate(updatedAt)}
          </Text>
        </View>
      </View>
    </DebouncedTouchableOpacity>
  );
};

export default InactiveRackItem;
