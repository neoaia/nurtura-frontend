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

const InactiveRackItemSkeleton: React.FC = () => {
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
    <View className="bg-white rounded-2xl py-6 px-5 shadow-md border border-gray-100 w-full mb-5">
      {/* Top row: icon + name/plant */}
      <View className="flex-row items-center gap-5 flex-1 mb-4">
        {/* Icon box */}
        <ShimmerBlock
          width={56}
          height={56}
          borderRadius={12}
          animatedValue={animatedValue}
        />

        <View className="flex-1 gap-2">
          {/* Name */}
          <ShimmerBlock
            width="50%"
            height={16}
            borderRadius={6}
            animatedValue={animatedValue}
          />
          {/* Last plant */}
          <ShimmerBlock
            width="38%"
            height={12}
            borderRadius={6}
            animatedValue={animatedValue}
          />
        </View>
      </View>

      {/* Bottom row: date created + removed */}
      <View className="flex-row justify-between items-center pt-4 border-t border-gray-100 mt-2 px-1">
        <View className="gap-1.5">
          {/* Label */}
          <ShimmerBlock
            width={72}
            height={11}
            borderRadius={5}
            animatedValue={animatedValue}
          />
          {/* Value */}
          <ShimmerBlock
            width={90}
            height={13}
            borderRadius={5}
            animatedValue={animatedValue}
          />
        </View>

        <View className="items-end gap-1.5">
          {/* Label */}
          <ShimmerBlock
            width={56}
            height={11}
            borderRadius={5}
            animatedValue={animatedValue}
          />
          {/* Value */}
          <ShimmerBlock
            width={90}
            height={13}
            borderRadius={5}
            animatedValue={animatedValue}
          />
        </View>
      </View>
    </View>
  );
};

export default InactiveRackItemSkeleton;
