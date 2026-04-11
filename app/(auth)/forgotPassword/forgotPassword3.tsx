import { typography } from "@/assets/fonts/Text";
import { PasswordInput } from "@/components/auth/passwordInput";
import { InfoModal } from "@/components/modals/infoModal";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { useAuth } from "@/contexts/AuthContext";
import useFetch from "@/hooks/useFetch";
import { authService } from "@/services/authService";
import { NavigationService, ROUTES } from "@/utils/navigationUtils";
import {
  cleanInput,
  isStrongPassword,
  validatePassword,
} from "@/utils/validation";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ForgotPassword3 = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [onModalConfirm, setOnModalConfirm] = useState<() => void>(() => {});

  const showModal = (
    title: string,
    message: string,
    onConfirm: () => void = () => setModalVisible(false),
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setOnModalConfirm(() => onConfirm);
    setModalVisible(true);
  };

  const { email } = useLocalSearchParams();
  const { logout } = useAuth();
  const navService = new NavigationService(router);

  const isNextButtonEnabled =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    validatePassword(password) &&
    validatePassword(confirmPassword) &&
    password === confirmPassword;

  const isPasswordValid = isStrongPassword(password);
  const isConfirmPasswordValid = isStrongPassword(confirmPassword);
  const passwordsMatch = password === confirmPassword;

  const { refetch: resetPassword } = useFetch("/auth/update-password", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  const getPasswordStrengthColor = (pwd: string) => {
    if (pwd.length === 0) return "#919191";
    return isStrongPassword(pwd) ? "#4CAF50" : "#E65656";
  };

  const handleNextPress = async () => {
    if (!email) {
      showModal(
        "Error",
        "Email is missing. Please restart the password reset process.",
      );
      return;
    }

    setLoading(true);

    if (!passwordsMatch) {
      showModal("Error", "Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const resetResponse = await authService.resetPassword(
        resetPassword,
        password,
      );

      if (!resetResponse.success) {
        showModal(
          "Error",
          resetResponse.message ||
            "Failed to reset password. Please try again.",
        );
        setLoading(false);
        return;
      }

      await SecureStore.deleteItemAsync("forgotPasswordInProgress");
      await logout();

      showModal("Success", "Your password has been reset successfully.", () =>
        navService.replace(ROUTES.AUTH.LOGIN),
      );
    } catch (error) {
      showModal("Error", "Failed to reset password. Please try again.");
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  useEffect(() => {
    const loadPasswords = async () => {
      const savedPassword = await SecureStore.getItemAsync(
        "forgot_password_new_password",
      );
      const savedConfirmPassword = await SecureStore.getItemAsync(
        "forgot_password_confirm_password",
      );

      if (savedPassword) setPassword(savedPassword);
      if (savedConfirmPassword) setConfirmPassword(savedConfirmPassword);
    };
    loadPasswords();
  }, []);

  useEffect(() => {
    const savePasswords = () => {
      if (password)
        SecureStore.setItemAsync("forgot_password_new_password", password);
      if (confirmPassword)
        SecureStore.setItemAsync(
          "forgot_password_confirm_password",
          confirmPassword,
        );
    };
    savePasswords();
  }, [password, confirmPassword]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <View className="flex-1 p-6">
        <Text style={typography["h1-bold"]} className="text-black mt-4 mb-2">
          Set new password
        </Text>

        <Text
          style={typography["subheader"]}
          className="mb-6 text-black leading-normal"
        >
          Enter a secure password to protect your account.
        </Text>

        <View className="w-full mb-2">
          <PasswordInput
            label="Set password"
            value={password}
            onChangeText={(text) => setPassword(cleanInput(text))}
            isVisible={isPasswordVisible}
            onToggleVisibility={togglePasswordVisibility}
            borderColor={getPasswordStrengthColor(password)}
          />
          {!isPasswordValid && password.length > 0 && (
            <Text
              style={typography["subheader"]}
              className="text-[#E65656] mb-2"
            >
              Password must have 8+ chars, uppercase, number & symbol.
            </Text>
          )}
        </View>

        <View className="w-full mb-6">
          <PasswordInput
            label="Confirm password"
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(cleanInput(text))}
            isVisible={isPasswordVisible}
            onToggleVisibility={togglePasswordVisibility}
            borderColor={
              confirmPassword.length === 0
                ? "#919191"
                : !passwordsMatch
                  ? "#E65656"
                  : getPasswordStrengthColor(confirmPassword)
            }
          />
          {!passwordsMatch && confirmPassword.length > 0 && (
            <Text
              style={typography["subheader"]}
              className="text-[#E65656] mb-2"
            >
              Passwords do not match.
            </Text>
          )}
          {!isConfirmPasswordValid &&
            confirmPassword.length > 0 &&
            passwordsMatch && (
              <Text
                style={typography["subheader"]}
                className="text-[#E65656] mb-2"
              >
                Password must have 8+ chars, uppercase, number & symbol.
              </Text>
            )}
        </View>
      </View>

      <View className="px-6 pb-9">
        <PrimaryButton
          title={loading ? "Loading..." : "Finish"}
          onPress={handleNextPress}
          disabled={!isNextButtonEnabled || loading}
          loading={loading}
        />
      </View>

      <InfoModal
        isVisible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onConfirm={() => {
          onModalConfirm();
          setModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

export default ForgotPassword3;
