import { typography } from "@/assets/fonts/Text";
import { ColoredButton } from "@/components/shared/coloredButton";
import { HollowButton } from "@/components/shared/hollowButton"; // Import your hollow button
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

  return (
    <View className="flex-1 bg-white">
      <View className="relative w-full h-[45%] flex justify-center items-center">
        <Image 
          source={require("@/assets/images/successScreen.png")} 
          className="w-full h-full" 
          resizeMode="cover" 
        />
      </View>

      <View className="flex-1 px-8 pt-10">
        <Text style={typography["h1-bold"]} className="text-black mb-4">
          {params.title || "Success!"}
        </Text>
        <Text style={typography["subheader"]} className="text-gray-600 leading-6">
          {params.subtitle}{" "}
          <Text className="font-bold text-black">{params.highlight}</Text>
        </Text>
      </View>

      <View className="px-6 pb-12 gap-3">
        {/* Main Button for other pages*/}
        <ColoredButton 
          title={params.finishTitle || "Finish"} 
          onPress={() => {
            const isMultiStep = params.type === "plant" || params.type === "rack";
            isMultiStep 
              ? router.replace("/(tabs)/(home)") 
              : router.back();
          }} 
        />

        {/* Check for BOTH plant or rack pages heree */}
        {(params.type === "plant" || params.type === "rack") && (
          <HollowButton 
            title={params.addAnotherTitle || "Add another"} 
            onPress={() => router.replace("/(tabs)/(addNewRack)/step-1")} 
          />
        )}
      </View>
    </View>
  );
}