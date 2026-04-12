import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNetwork } from "../../contexts/NetworkContext";
import { DebouncedTouchableOpacity } from "./debouncedTouchable";

export const NetworkToast = () => {
  const { isReady, toast, dismissToast } = useNetwork();

  if (!isReady || !toast) {
    return null;
  }

  const isOnline = toast.tone === "online";
  const backgroundClass = isOnline ? "bg-[#32a846]" : "bg-red-500";
  const badgeIconColor = isOnline ? "#22c55e" : "#ef4444";

  return (
    <View
      className="absolute top-0 left-0 right-0 z-50 px-4"
      pointerEvents="box-none"
    >
      <SafeAreaView edges={["top"]} pointerEvents="box-none">
        <View
          className={`mt-2 rounded-xl px-4 py-3 shadow-lg flex-row items-center gap-3 ${backgroundClass}`}
        >
          <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
            <Ionicons
              name={isOnline ? "checkmark" : "alert"}
              size={16}
              color={badgeIconColor}
            />
          </View>

          <Text className="flex-1 text-[15px] leading-5 font-medium text-white">
            {toast.message}
          </Text>

          <DebouncedTouchableOpacity
            onPress={dismissToast}
            className="w-7 h-7 items-center justify-center rounded-full"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-white text-xl font-bold">X</Text>
          </DebouncedTouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};
