import { typography } from "@/assets/fonts/Text";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { BottomButton } from "@/components/shared/bottomButton";
import SmallDescription from "@/components/shared/smallDescription";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

const AddNewPlant3 = () => {
  const [confirmation, setConfirmation] = React.useState(false);

  // recieve params from step-2
  const {
    rackId,
    rackName,
    rackValue,
    plantId,
    plantName,
    plantCategory,
    plantType,
  } = useLocalSearchParams<{
    rackId: string;
    rackName: string;
    rackValue: string;
    plantId: string;
    plantName: string;
    plantCategory: string;
    plantType: string;
  }>();

  const handleNextPress = () => {
    setConfirmation(true);
  };

  const handleCancelPress = () => {
    setConfirmation(false);
  };

  const handleConfirmPress = () => {
    setConfirmation(false);
    console.log("rack id: " + rackId);
    console.log("rack name: " + rackName);
    console.log("rack value: " + rackValue);
    console.log("plant id: " + plantId);
    console.log("plant name: " + plantName);
    console.log("plant category: " + plantCategory);
    console.log("plant type: " + plantType);
    router.dismissAll();
    router.push("/(tabs)/(home)");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{}}
      >
        <View className="flex-1 justify-center items-center pl-8">
          <Image
            source={require("@/assets/images/plant-images/lettuce.png")}
            className="w-72 h-72 mt-4"
            resizeMode="cover"
          />
        </View>

        <View className="w-full flex-row justify-between items-start mb-6">
          <View className="flex-1 pl-2">
            <Text style={typography["h1-bold"]} className="text-black">
              {plantName}
            </Text>
            <Text style={typography["subheader"]} className="text-grayText">
              {plantCategory}
            </Text>
          </View>
        </View>

        <View className="flex-col gap-8 mb-8 pl-2">
          <SmallDescription
            label="Recommended Soil"
            value="Loam + Compost + Perlite"
          />
          <SmallDescription label="Selected Rack" value={rackName} />
        </View>
      </ScrollView>

      <BottomButton title="Finish" onPress={handleNextPress} />
      <ConfirmationModal
        isVisible={confirmation}
        title="Important!"
        message="Make sure to plant the seeds before finalizing."
        onCancel={handleCancelPress}
        onConfirm={handleConfirmPress}
      />
    </View>
  );
};

export default AddNewPlant3;
