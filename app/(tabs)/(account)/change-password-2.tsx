import { typography } from "@/assets/fonts/Text";
import { PasswordInput } from "@/components/auth/passwordInput";
import { InfoModal } from "@/components/modals/infoModal";
import { PrimaryButton } from "@/components/shared/primaryButton";
import useFetch from "@/hooks/useFetch";
import { authService } from "@/services/authService";
import { createLogger } from "@/utils/logger";
import { NavigationService, ROUTES } from "@/utils/navigationUtils";
import {
  cleanInput,
  isStrongPassword,
  validatePassword,
} from "@/utils/validation";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const logger = createLogger("ChangePassword2");

export default function ChangePassword2() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalTitle, setInfoModalTitle] = useState("");
  const [infoModalMessage, setInfoModalMessage] = useState("");
  const router = useRouter();
  const navService = new NavigationService(router);

  const { refetch: changePassword } = useFetch("/auth/update-password", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  const isPasswordValid = isStrongPassword(password);
  const isConfirmPasswordValid = isStrongPassword(confirmPassword);
  const passwordsMatch = password === confirmPassword;

  const isNextButtonEnabled =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    validatePassword(password) &&
    validatePassword(confirmPassword) &&
    passwordsMatch;

  const showInfoModal = (title: string, message: string) => {
    setInfoModalTitle(title);
    setInfoModalMessage(message);
    setInfoModalVisible(true);
  };

  useEffect(() => {
    const loadVerifiedEmail = async () => {
      try {
        const email = await SecureStore.getItemAsync(
          "change_password_verified_email",
        );
        if (!email) {
          showInfoModal(
            "Error",
            "Verification required. Please complete the OTP verification first.",
          );
          navService.goBack();
          return;
        }
        setVerifiedEmail(email);
        logger.log("Verified email loaded");
      } catch (error) {
        logger.error("Error loading verified email", error);
        showInfoModal("Error", "Failed to load verification status.");
      }
    };
    loadVerifiedEmail();
  }, []);

  const handlePasswordChange = (value: string) => {
    setPassword(cleanInput(value));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(cleanInput(value));
  };

  const handleNextPress = async () => {
    if (!verifiedEmail) {
      showInfoModal(
        "Error",
        "Email verification is missing. Please restart the process.",
      );
      return;
    }

    if (!passwordsMatch) {
      showInfoModal("Error", "Passwords do not match.");
      return;
    }

    if (!isPasswordValid || !isConfirmPasswordValid) {
      showInfoModal(
        "Error",
        "Password must have 8+ characters, uppercase, number & symbol.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(
        changePassword,
        password,
      );

      if (!response.success) {
        showInfoModal(
          "Error",
          response.message || "Failed to change password. Please try again.",
        );
        setLoading(false);
        return;
      }

      logger.log("Password changed successfully");

      await SecureStore.deleteItemAsync("change_password_verified_email");

      navService.reset(ROUTES.TABS.ACCOUNT.SUCCESS, {
        type: "other",
        title: "Password updated!",
        subtitle: "You can now proceed back to making your account safe.",
        finishTitle: "Finish",
      });
    } catch (error) {
      logger.error("Error changing password:", error);
      showInfoModal("Error", "Failed to change password. Please try again.");
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = (pwd: string) => {
    if (pwd.length === 0) return "#919191";
    return isStrongPassword(pwd) ? "#4CAF50" : "#E65656";
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <Text style={typography["h1-bold"]} className="text-black mt-4 mb-2">
          Set new password
        </Text>
        <Text
          style={typography["subheader"]}
          className="mb-6 text-black leading-normal"
        >
          Enter a secure password to protect your account.
        </Text>

        <View className="flex-col gap-2">
          <View>
            <PasswordInput
              label="Password"
              value={password}
              onChangeText={handlePasswordChange}
              borderColor={getPasswordStrengthColor(password)}
            />
            {!isPasswordValid && password.length > 0 && (
              <Text className="text-[#E65656] text-[13px] mt-1">
                Password must have 8+ chars, uppercase, number & symbol.
              </Text>
            )}
          </View>

          <View>
            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              borderColor={
                confirmPassword.length === 0
                  ? "#919191"
                  : !passwordsMatch
                    ? "#E65656"
                    : getPasswordStrengthColor(confirmPassword)
              }
            />
            {!passwordsMatch && confirmPassword.length > 0 && (
              <Text className="text-[#E65656] text-[13px] mt-1">
                Passwords do not match.
              </Text>
            )}
            {passwordsMatch &&
              confirmPassword.length > 0 &&
              !isConfirmPasswordValid && (
                <Text className="text-[#E65656] text-[13px] mt-1">
                  Password must have 8+ chars, uppercase, number & symbol.
                </Text>
              )}
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-9">
        <PrimaryButton
          title={loading ? "Updating..." : "Finish"}
          onPress={handleNextPress}
          disabled={!isNextButtonEnabled || loading}
        />
      </View>

      <InfoModal
        isVisible={infoModalVisible}
        title={infoModalTitle}
        message={infoModalMessage}
        onConfirm={() => setInfoModalVisible(false)}
      />
    </SafeAreaView>
  );
}
