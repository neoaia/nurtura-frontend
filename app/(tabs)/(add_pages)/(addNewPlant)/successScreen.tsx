import { typography } from "@/assets/fonts/Text";
import { ColoredButton } from "@/components/shared/coloredButton";
import { HollowButton } from "@/components/shared/hollowButton";
import { NavigationService, ROUTES } from "@/utils/navigationUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

export default function SuccessPage() {
  const router = useRouter();
  const navService = new NavigationService(router);

  const params = useLocalSearchParams<{
    title: string;
    subtitle: string;
    highlight: string;
    finishTitle?: string;
    addAnotherTitle?: string;
    type?: "other" | "plant" | "rack";
  }>();

  /**
   * Finish the flow and return to home
   * Uses reset to clear entire stack of add flow screens
   */
  const handleFinish = () => {
    navService.completeFlow();
  };

  /**
   * Add another plant/rack
   * Clears current stack and goes back to step 1
   */
  const handleAddAnother = () => {
    if (params.type === "rack") {
      navService.reset(ROUTES.TABS.ADD.RACK.STEP_1);
    } else {
      navService.reset(ROUTES.TABS.ADD.PLANT.STEP_1);
    }
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

      <View className="flex-1 px-6 pt-10">
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

      <View className="px-4 pb-12 gap-1">
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
