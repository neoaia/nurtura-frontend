import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

const ShimmerBlock = ({
  width,
  height,
  borderRadius = 8,
  animatedValue,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  animatedValue: Animated.Value;
}) => {
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#f0f0f0", "#e0e0e0"],
  });

  return (
    <Animated.View
      style={{
        width: width as any,
        height,
        borderRadius,
        backgroundColor,
      }}
    />
  );
};

interface TextInputFieldSkeletonProps {
  width?: string;
}

export const TextInputFieldSkeleton = ({
  width = "w-[100%]",
}: TextInputFieldSkeletonProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  return (
    <View
      className={`${width} py-5 px-3 rounded-2xl bg-white mb-[10px] shadow-md elevation-3`}
    >
      {/* Label shimmer */}
      <ShimmerBlock
        width="40%"
        height={11}
        borderRadius={6}
        animatedValue={animatedValue}
      />
      {/* Value shimmer */}
      <View className="mt-2">
        <ShimmerBlock
          width="70%"
          height={14}
          borderRadius={6}
          animatedValue={animatedValue}
        />
      </View>
    </View>
  );
};
