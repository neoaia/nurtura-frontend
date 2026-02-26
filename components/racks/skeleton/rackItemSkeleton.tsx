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

const RackItemSkeleton: React.FC = () => {
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
      {/* Top row: icon + name/plant + status dot */}
      <View className="flex-row justify-between items-center mb-7">
        <View className="flex-row items-center gap-5 flex-1">
          {/* Icon placeholder */}
          <ShimmerBlock
            width={56}
            height={56}
            borderRadius={12}
            animatedValue={animatedValue}
          />

          <View className="flex-1 gap-2">
            {/* Name */}
            <ShimmerBlock
              width="55%"
              height={16}
              borderRadius={6}
              animatedValue={animatedValue}
            />
            {/* Plant */}
            <ShimmerBlock
              width="35%"
              height={12}
              borderRadius={6}
              animatedValue={animatedValue}
            />
          </View>
        </View>

        {/* Status dot */}
        <ShimmerBlock
          width={12}
          height={12}
          borderRadius={6}
          animatedValue={animatedValue}
        />
      </View>

      {/* Bottom row: sensor metrics */}
      <View className="flex-row justify-center items-center w-full gap-10">
        {[0, 1, 2, 3].map((i) => (
          <ShimmerBlock
            key={i}
            width={40}
            height={14}
            borderRadius={6}
            animatedValue={animatedValue}
          />
        ))}
      </View>
    </View>
  );
};

export default RackItemSkeleton;
