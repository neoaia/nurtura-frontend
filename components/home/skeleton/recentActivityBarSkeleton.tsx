import { ShimmerBlock } from "@/components/shared/skeleton/shimmerBlock";
import React from "react";
import { View } from "react-native";

const ActivityItemSkeleton = () => (
  <View className="bg-white mb-2 py-5 px-3 w-full flex-row items-center rounded-xl shadow-md">
    <ShimmerBlock width={56} height={56} borderRadius={16} />
    <View className="flex-1 ml-6">
      <ShimmerBlock width="70%" height={14} borderRadius={6} />
      <View className="mt-1">
        <ShimmerBlock width="45%" height={14} borderRadius={6} />
      </View>
      <View className="flex-row items-center gap-10 mt-4">
        <ShimmerBlock width={80} height={11} borderRadius={5} />
        <ShimmerBlock width={80} height={11} borderRadius={5} />
      </View>
    </View>
  </View>
);

export const RecentActivityBarSkeleton: React.FC = () => {
  return (
    <>
      <View className="pb-4 px-4">
        <ShimmerBlock width={140} height={20} borderRadius={6} />
      </View>
      <View>
        <ActivityItemSkeleton />
        <ActivityItemSkeleton />
        <ActivityItemSkeleton />
      </View>
    </>
  );
};
