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

export const PlantStatusIndicatorsSkeleton: React.FC = () => {
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
    <View className="items-center bg-white rounded-xl py-4 px-3 shadow-md border border-gray-100 flex-1 mx-1">
      <ShimmerBlock
        width={40}
        height={40}
        borderRadius={8}
        animatedValue={animatedValue}
      />
      <View className="mt-2">
        <ShimmerBlock
          width={52}
          height={10}
          borderRadius={5}
          animatedValue={animatedValue}
        />
      </View>
      <View className="mt-1.5">
        <ShimmerBlock
          width={36}
          height={13}
          borderRadius={5}
          animatedValue={animatedValue}
        />
      </View>
    </View>
  );
};
