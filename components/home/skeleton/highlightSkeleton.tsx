import { ShimmerBlock } from "@/components/shared/skeleton/shimmerBlock";
import React from "react";
import { View } from "react-native";

const OVERFLOW_AMOUNT = 20;

export const HighlightSkeleton: React.FC = () => {
  return (
    <View className="mb-8">
      <View
        style={{
          paddingTop: OVERFLOW_AMOUNT,
          overflow: "hidden",
          paddingHorizontal: 6,
          paddingBottom: 10,
        }}
      >
        <View className="rounded-2xl p-6 bg-white shadow-md">
          <View className="flex-row items-end justify-between">
            <View className="flex-1 pr-4">
              <ShimmerBlock width="60%" height={22} borderRadius={6} />
              <View className="mt-2 mb-7">
                <ShimmerBlock width="80%" height={13} borderRadius={5} />
                <View className="mt-1">
                  <ShimmerBlock width="55%" height={13} borderRadius={5} />
                </View>
              </View>
              <ShimmerBlock width={120} height={44} borderRadius={8} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
