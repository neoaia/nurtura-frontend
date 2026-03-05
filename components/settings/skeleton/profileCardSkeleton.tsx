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

const ProfileCardSkeleton: React.FC = () => {
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
    <View className="w-full bg-white rounded-2xl py-5 px-6 flex-row items-center shadow-md elevation-3">
      {/* Avatar circle */}
      <ShimmerBlock
        width={56}
        height={56}
        borderRadius={28}
        animatedValue={animatedValue}
      />

      {/* Name + label */}
      <View className="ml-5 gap-2">
        <ShimmerBlock
          width={60}
          height={12}
          borderRadius={6}
          animatedValue={animatedValue}
        />
        <ShimmerBlock
          width={120}
          height={16}
          borderRadius={6}
          animatedValue={animatedValue}
        />
      </View>
    </View>
  );
};

export default ProfileCardSkeleton;
