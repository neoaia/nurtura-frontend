import { typography } from "@/assets/fonts/Text";
import { ColoredButton } from "@/components/shared/coloredButton";
import { HollowButton } from "@/components/shared/hollowButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

export default function SuccessPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title: string;
    subtitle: string;
    highlight: string;
    finishTitle?: string;
    addAnotherTitle?: string;
    type?: "other" | "plant" | "rack";
  }>();

  const handleFinish = () => {
    const isMultiStep = params.type === "plant" || params.type === "rack";

    if (isMultiStep) {
      router.dismissAll();
      router.replace("/(tabs)/(home)");
    } else {
      router.back();
    }
  };

  const handleAddAnother = () => {
    router.dismissAll();
    router.replace("/(tabs)/(addNewRack)/step-1");
  };

  return (
    <View className="flex-1 bg-white">
      <View className="relative w-full h-[45%] flex justify-center items-center">
        <Image
          source={require("@/assets/images/successScreen.png")}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>

      <View className="flex-1 pt-10 px-6">
        <Text style={typography["h1-bold"]} className="text-black mb-4">
          {params.title || "Success!"}
        </Text>
        <Text
          style={typography["subheader"]}
          className="text-gray-600 leading-6"
        >
          {params.subtitle}{" "}
          <Text className="font-bold text-black">{params.highlight}</Text>
        </Text>
      </View>

      <View className=" pb-12 gap-1 px-4">
        <ColoredButton
          title={params.finishTitle || "Finish"}
          onPress={handleFinish}
        />

        {(params.type === "plant" || params.type === "rack") && (
          <HollowButton
            title={params.addAnotherTitle || "Add another"}
            onPress={handleAddAnother}
          />
        )}
      </View>
    </View>
  );
}
