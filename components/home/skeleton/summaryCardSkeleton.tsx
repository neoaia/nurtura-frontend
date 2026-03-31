import { ShimmerBlock } from "@/components/shared/skeleton/shimmerBlock";
import React from "react";
import { View } from "react-native";

const SingleCardSkeleton = ({ marginClass }: { marginClass: string }) => (
  <View
    className={`flex-1 bg-white border border-gray-100 rounded-2xl py-5 px-4 my-1 shadow-md ${marginClass}`}
  >
    <View className="flex-row items-start justify-between mb-4">
      <ShimmerBlock width={52} height={52} borderRadius={12} />
      <ShimmerBlock width={32} height={24} borderRadius={6} />
    </View>
    <ShimmerBlock width="55%" height={16} borderRadius={6} />
    <View className="mt-2">
      <ShimmerBlock width="40%" height={12} borderRadius={5} />
    </View>
  </View>
);

export const SummaryCardSkeleton: React.FC = () => {
  return (
    <View className="flex-row w-full px-4 justify-between">
      <SingleCardSkeleton marginClass="mr-2" />
      <SingleCardSkeleton marginClass="ml-2" />
    </View>
  );
};
