import { typography } from "@/assets/fonts/Text";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { BottomButton } from "@/components/shared/bottomButton";
import { QuantityPicker } from "@/components/shared/quantityPicker";
import SmallDescription from "@/components/shared/smallDescription";
import { useBackWarning } from "@/hooks/shared/useBackWarning";
import useFetch from "@/hooks/useFetch";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import RackIcon from "../../../../assets/images/icons/rack(Add).svg";
import SoilIcon from "../../../../assets/images/icons/soil.svg";

const AddNewPlant3 = () => {
  const [confirmation, setConfirmation] = useState(false);
  const [seedQuantity, setSeedQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  const { showModal, handleConfirm, handleCancel } =
    useBackWarning(!!seedQuantity);

  const {
    rackId,
    rackName,
    plantId,
    plantName,
    plantCategory,
    plantType,
    recommendedSoil,
  } = useLocalSearchParams<{
    rackId: string;
    rackName: string;
    rackValue: string;
    plantId: string;
    plantName: string;
    plantCategory: string;
    plantType: string;
    recommendedSoil: string;
  }>();

  const { refetch: assignPlant } = useFetch(`/api/plants/${plantId}/assign`, {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  const handleNextPress = () => {
    if (!seedQuantity) return;
    setConfirmation(true);
  };

  const handleCancelPress = () => setConfirmation(false);

  const handleConfirmPress = async () => {
    setConfirmation(false);
    setLoading(true);

    try {
      const { data, error } = await assignPlant({
        body: {
          rackId: rackId as string,
          quantity: seedQuantity,
          plantedAt: new Date().toISOString(),
        },
      });

      console.log("Assign plant response:", data, error);

      if (error) {
        Alert.alert(
          "Error",
          error?.message || "Failed to assign plant. Please try again.",
        );
        return;
      }

      console.log("Plant assigned successfully:", data?.message);

      router.dismissAll();
      router.push({
        pathname: "/(tabs)/(add_pages)/(addNewPlant)/successScreen",
        params: {
          type: "plant",
          title: "Plant added successfully!",
          subtitle: "Your plant has been added to the rack.",
          finishTitle: "Finish",
          addAnotherTitle: "Add another Plant",
        },
      });
    } catch (e) {
      console.error("Failed to assign plant:", e);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
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
            value={recommendedSoil || "Loam + Compost + Perlite"}
            Icon={SoilIcon}
          />
          <SmallDescription
            label="Selected Rack"
            value={rackName}
            Icon={RackIcon}
          />
          <QuantityPicker
            title="Seeds"
            quantity={seedQuantity}
            onAddPress={() =>
              seedQuantity < 4 && setSeedQuantity(seedQuantity + 1)
            }
            onSubtractPress={() =>
              seedQuantity > 0 && setSeedQuantity(seedQuantity - 1)
            }
          />
        </View>
      </ScrollView>

      <BottomButton
        title={loading ? "Adding..." : "Finish"}
        onPress={handleNextPress}
        disabled={!seedQuantity || loading}
      />

      {/* Confirm planting reminder */}
      <ConfirmationModal
        isVisible={confirmation}
        title="Important!"
        message="Make sure to plant the seeds before finalizing."
        onCancel={handleCancelPress}
        onConfirm={handleConfirmPress}
      />

      {/* Back warning */}
      <ConfirmationModal
        isVisible={showModal}
        onConfirm={handleConfirm}
        title="Go Back"
        message="All details you have entered will be restarted and gone."
        confirmText="Continue"
        cancelText="Cancel"
        onCancel={handleCancel}
      />
    </View>
  );
};

export default AddNewPlant3;
