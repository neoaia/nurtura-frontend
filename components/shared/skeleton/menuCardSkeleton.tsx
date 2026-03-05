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
      style={{ width: width as any, height, borderRadius, backgroundColor }}
    />
  );
};

export const MenuCardSkeleton: React.FC = () => {
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
    <View className="bg-white rounded-2xl px-6 py-8 flex-row items-center border border-gray-100 shadow-md elevation-3 gap-3">
      <ShimmerBlock
        width={56}
        height={56}
        borderRadius={12}
        animatedValue={animatedValue}
      />
      <View className="flex-1 ml-4 pr-2 gap-2">
        <ShimmerBlock
          width="50%"
          height={14}
          borderRadius={6}
          animatedValue={animatedValue}
        />
        <ShimmerBlock
          width="80%"
          height={11}
          borderRadius={6}
          animatedValue={animatedValue}
        />
        <ShimmerBlock
          width="60%"
          height={11}
          borderRadius={6}
          animatedValue={animatedValue}
        />
      </View>
      <ShimmerBlock
        width={52}
        height={52}
        borderRadius={12}
        animatedValue={animatedValue}
      />
    </View>
  );
};
