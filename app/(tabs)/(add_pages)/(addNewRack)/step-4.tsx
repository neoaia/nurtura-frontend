import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import { typography } from "@/assets/fonts/Text";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { BottomButton } from "@/components/shared/bottomButton";
import { TextInputField } from "@/components/shared/textInputField";
import { useBackWarning } from "@/hooks/shared/useBackWarning";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService";
import type { RegisterRackRequestDTO } from "@/types/rack.dto";
import { createLogger } from "@/utils/logger";
import { cleanInput } from "@/utils/validation";
import { router, useLocalSearchParams } from "expo-router";

const logger = createLogger("AddNewRack3");

export default function AddNewRack3() {
  const [rackName, setRackName] = useState("");
  const [loading, setLoading] = useState(false);
  const { showModal, handleConfirm, handleCancel } = useBackWarning();

  // Get macAddress from previous screen
  const params = useLocalSearchParams();
  const macAddress = params.macAddress as string;

  const { refetch: registerRack } = useFetch("/api/racks", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  // Validate that macAddress was passed
  useEffect(() => {
    if (!macAddress) {
      logger.error("No macAddress provided from previous screen");
      Alert.alert(
        "Error",
        "MAC Address is missing. Please go back and scan the QR code again.",
        [
          {
            text: "Go Back",
            onPress: () => router.back(),
          },
        ],
      );
    }
  }, [macAddress]);

  const handleRackNameChange = (value: string) => {
    const cleaned = cleanInput(value);
    setRackName(cleaned);
  };

  const handleNextPress = async () => {
    // Validate rack name
    const trimmedName = rackName.trim();

    if (!trimmedName) {
      Alert.alert("Error", "Please enter a rack name");
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert("Error", "Rack name must be at least 2 characters");
      return;
    }

    if (trimmedName.length > 50) {
      Alert.alert("Error", "Rack name must be less than 50 characters");
      return;
    }

    // Validate macAddress
    if (!macAddress) {
      Alert.alert(
        "Error",
        "MAC Address is missing. Please go back and try again.",
      );
      return;
    }

    setLoading(true);

    try {
      logger.log("Registering rack:", { name: trimmedName, macAddress });

      // Prepare request body according to your DTO
      const requestBody: RegisterRackRequestDTO = {
        name: trimmedName,
        macAddress: macAddress,
      };

      // Call rackService to register the rack
      const response = await rackService.registerRack(
        registerRack,
        requestBody,
      );

      logger.debug("Register rack response:", response);

      // Check if response indicates success
      // Adjust based on your actual response structure
      if (!response) {
        logger.error("Failed to register rack: No response");
        Alert.alert("Error", "Failed to register rack. Please try again.");
        return;
      }

      logger.log("Rack registered successfully", response);

      // Navigate to success screen
      router.dismissAll();
      router.push({
        pathname: "/(tabs)/(add_pages)/(addNewRack)/successScreen",
        params: {
          type: "rack",
          title: "Rack added successfully!",
          subtitle: "You can now start using your Nurtura Rack.",
          finishTitle: "Finish",
          addAnotherTitle: "Add another Rack",
          // Adjust based on your actual response structure
          rackId: (response as any)?.rackId || (response as any)?.id || "",
        },
      });
    } catch (error) {
      logger.error("Exception while registering rack:", error);

      // Check if it's a validation error or network error
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled =
    loading || rackName.trim().length === 0 || !macAddress;

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 34 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mb-3 pl-2">
          Customize your{" "}
          <Text style={typography["h1-bold"]} className="text-primary">
            Nurtura Rack
          </Text>
        </Text>

        <Text
          style={typography["subheader"]}
          className="pl-2 mb-6 text-black leading-normal"
        >
          Rename your rack based on your personal preference.
        </Text>

        <View className="flex-col gap-2">
          <TextInputField
            label="Rack Name"
            value={rackName}
            onChangeText={handleRackNameChange}
          />

          {rackName.trim().length > 0 && (
            <Text className="text-gray-500 pl-2 text-sm">
              {rackName.trim().length}/50 characters
            </Text>
          )}

          {/* Debug info - remove in production */}
          {__DEV__ && macAddress && (
            <Text className="text-gray-400 pl-2 text-xs mt-2">
              MAC: {macAddress}
            </Text>
          )}
        </View>
      </ScrollView>
      <View>
        <BottomButton
          title={loading ? "Registering..." : "Finish"}
          onPress={handleNextPress}
          disabled={isButtonDisabled}
        />
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
    </View>
  );
}
