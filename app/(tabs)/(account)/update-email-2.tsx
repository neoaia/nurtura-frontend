import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { typography } from "@/assets/fonts/Text";
import { EmailInput } from "@/components/auth/emailInput";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { InfoModal } from "@/components/modals/infoModal";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { useBackWarning } from "@/hooks/shared/useBackWarning";
import useFetch from "@/hooks/useFetch";
import { authService } from "@/services/authService";
import { logger } from "@/utils/logger";
import { NavigationService, ROUTES } from "@/utils/navigationUtils";
import { cleanInput, validateEmail } from "@/utils/validation";
import { router } from "expo-router";

export default function UpdateEmailScreen2() {
  const { showModal, handleConfirm, handleCancel } = useBackWarning();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalTitle, setInfoModalTitle] = useState("");
  const [infoModalMessage, setInfoModalMessage] = useState("");

  const showInfoModal = (title: string, message: string) => {
    setInfoModalTitle(title);
    setInfoModalMessage(message);
    setInfoModalVisible(true);
  };

  const navService = new NavigationService(router);

  const { refetch: checkEmailExists } = useFetch("/users/exists", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const validateEmailFormat = (email: string): string[] => {
    if (!email) return ["Email is required"];

    const errors: string[] = [];

    if (!validateEmail(email))
      errors.push("Please enter a valid email address");
    if (email.length > 254) errors.push("Email address is too long");

    const [localPart] = email.split("@");
    if (localPart?.length > 64) errors.push("Email local part is too long");

    return errors;
  };

  const handleEmailChange = (value: string) => {
    const cleanValue = cleanInput(value);
    setEmail(cleanValue);

    const errors = validateEmailFormat(cleanValue);
    setEmailError(errors[0] ?? "");
    setIsEmailValid(errors.length === 0);
  };

  const handleNextPress = async () => {
    // Re-validate on submit in case the user bypasses onChange
    const formatErrors = validateEmailFormat(email);
    if (formatErrors.length > 0) {
      setEmailError(formatErrors[0]);
      return;
    }

    setIsLoading(true);
    setEmailError("");

    try {
      const emailResponse = await authService.emailAvailable(
        checkEmailExists,
        email,
      );

      if (!emailResponse.success) {
        setEmailError(
          emailResponse.message ??
            "Failed to check email availability. Please try again.",
        );
        return;
      }

      if (!emailResponse.available) {
        setEmailError("This email is already registered.");
        return;
      }

      navService.push(ROUTES.TABS.ACCOUNT.UPDATE_EMAIL_3, { email });
    } catch (error) {
      logger.error("Unexpected error in handleNextPress", error);

      const message =
        error instanceof Error && error.message.includes("Network")
          ? "Network error. Please check your connection and try again."
          : "An unexpected error occurred. Please try again.";

      showInfoModal("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 34 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mb-6 pl-2">
          Enter your new email
        </Text>
        <EmailInput
          value={email}
          onChangeText={handleEmailChange}
          error={emailError}
        />
      </ScrollView>

      <View className="px-4 pb-9">
        <PrimaryButton
          title="Next"
          onPress={handleNextPress}
          disabled={!isEmailValid}
          loading={isLoading}
        />

        <InfoModal
          isVisible={infoModalVisible}
          title={infoModalTitle}
          message={infoModalMessage}
          onConfirm={() => setInfoModalVisible(false)}
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
