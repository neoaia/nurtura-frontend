import { InfoModal } from "@/components/modals/infoModal";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
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
import { Image, Text, TextInput, View } from "react-native";

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
    <View className="flex-1 bg-white px-[16px] pb-[34px] w-screen justify-between h-screen">
      <View className="mt-[34px] flex-1 items-start">
        <Text className="text-black font-bold text-[24px] pr-[110px] mb-[13px] pl-2">
          Set new password
        </Text>

        <Text className="mb-[20px] text-[13px] text-gray-700 leading-normal pl-2">
          Enter a secure password to protect your account.
        </Text>

        <View className="relative w-full mb-[5px]">
          <View
            className={`w-[100%] pt-2 px-3 border-[2px] rounded-[12px] bg-white mb-[6px] ${
              password.length === 0
                ? "border-[#919191]"
                : isPasswordValid
                  ? "border-[#4CAF50]"
                  : "border-[#E65656]"
            }`}
          >
            <Text className="text-primary text-[13px] pt-[4px] pl-[4px]">
              Set password
            </Text>

            <TextInput
              className="text-black text-[16px] pr-10"
              secureTextEntry={!isPasswordVisible}
              keyboardType="default"
              autoCapitalize="none"
              value={password}
              onChangeText={(text) => setPassword(cleanInput(text))}
              contextMenuHidden={true}
              selectTextOnFocus={false}
            />
          </View>

          {!isPasswordValid && password.length > 0 && (
            <Text className="text-[#E65656] text-[13px] mb-[10px] pl-2">
              Password must have 8+ chars, uppercase, number & symbol.
            </Text>
          )}

          <DebouncedTouchableOpacity
            onPress={togglePasswordVisibility}
            className="absolute right-5 top-[50%] -translate-y-1/2 pr-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={
                isPasswordVisible
                  ? require("@/assets/images/eyeopen.png")
                  : require("@/assets/images/eyeclosed.png")
              }
              className="w-5 h-5"
              resizeMode="contain"
            />
          </DebouncedTouchableOpacity>
        </View>

        <View className="relative w-full mb-[20px]">
          <View
            className={`w-[100%] pt-2 px-3 border-[2px] rounded-[12px] bg-white mb-[6px] ${
              confirmPassword.length === 0
                ? "border-[#919191]"
                : !passwordsMatch
                  ? "border-[#E65656]"
                  : isConfirmPasswordValid
                    ? "border-[#4CAF50]"
                    : "border-[#E65656]"
            }`}
          >
            <Text className="text-primary text-[13px] pt-[4px] pl-[4px]">
              Confirm password
            </Text>

            <TextInput
              className="text-black text-[16px] pr-10"
              secureTextEntry={!isPasswordVisible}
              keyboardType="default"
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(cleanInput(text))}
              contextMenuHidden={true}
              selectTextOnFocus={false}
            />
          </View>

          {!passwordsMatch && confirmPassword.length > 0 && (
            <Text className="text-[#E65656] text-[13px] mb-[10px] pl-2">
              Passwords do not match.
            </Text>
          )}

          {!isConfirmPasswordValid &&
            confirmPassword.length > 0 &&
            passwordsMatch && (
              <Text className="text-[#E65656] text-[13px] mb-[10px] pl-2">
                Password must have 8+ chars, uppercase, number & symbol.
              </Text>
            )}

          <DebouncedTouchableOpacity
            onPress={togglePasswordVisibility}
            className="absolute right-5 top-[50%] -translate-y-1/2 pr-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={
                isPasswordVisible
                  ? require("@/assets/images/eyeopen.png")
                  : require("@/assets/images/eyeclosed.png")
              }
              className="w-5 h-5"
              resizeMode="contain"
            />
          </DebouncedTouchableOpacity>
        </View>
      </View>

      <View className="w-full">
        <DebouncedTouchableOpacity
          onPress={handleNextPress}
          className={`w-full p-6 rounded-[12px] mt-2 flex items-center ${
            isNextButtonEnabled ? "bg-primary" : "bg-[#919191]"
          }`}
          disabled={!isNextButtonEnabled}
        >
          <Text className="text-white text-[16px] font-bold">
            {loading ? "Loading..." : "Finish"}
          </Text>
        </DebouncedTouchableOpacity>
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
    </View>
  );
};

export default ForgotPassword3;
