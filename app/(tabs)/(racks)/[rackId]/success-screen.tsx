import { typography } from "@/assets/fonts/Text";
import { ColoredButton } from "@/components/shared/coloredButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

export default function SuccessPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title: string;
    subtitle: string;
  }>();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <View className="relative w-full h-[50%] flex justify-center items-center">
        <Image
          source={require("@/assets/images/successScreen.png")}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>

      <View className="flex-1 px-6">
        <Text style={typography["h1-bold"]} className="text-black mb-4">
          {params.title || "Success!"}
        </Text>
        <Text
          style={typography["subheader"]}
          className="text-gray-600 leading-6"
        >
          {params.subtitle}
        </Text>
      </View>

      <View className="pb-12 gap-1 px-4">
        <ColoredButton title="Go Back" onPress={handleGoBack} />
      </View>
    </View>
  );
}
