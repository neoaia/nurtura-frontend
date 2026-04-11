import { typography } from "@/assets/fonts/Text";
import { PasswordInput } from "@/components/auth/passwordInput";
import { InfoModal } from "@/components/modals/infoModal";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { createLogger } from "@/utils/logger";
import { NavigationService, ROUTES } from "@/utils/navigationUtils";
import { isStrongPassword, validatePassword } from "@/utils/validation";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../globals.css";

const logger = createLogger("CreatePassword");

const CreatePassword = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalTitle, setInfoModalTitle] = useState("");
  const [infoModalMessage, setInfoModalMessage] = useState("");

  const showInfoModal = (title: string, message: string) => {
    setInfoModalTitle(title);
    setInfoModalMessage(message);
    setInfoModalVisible(true);
  };

  const navService = new NavigationService(router);

  const isPasswordValid = isStrongPassword(password);
  const isConfirmPasswordValid = isStrongPassword(confirmPassword);
  const passwordsMatch = password === confirmPassword;

  const { email } = useLocalSearchParams();

  const isNextButtonEnabled =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    validatePassword(password) &&
    validatePassword(confirmPassword) &&
    password === confirmPassword;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text.replace(/\s/g, ""));
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text.replace(/\s/g, ""));
  };

  const handleNextPress = async () => {
    logger.log("Next button pressed");
    setLoading(true);

    if (passwordsMatch && isPasswordValid && isConfirmPasswordValid) {
      try {
        logger.log("Password validation passed, navigating to createUserInfo");
        navService.push(ROUTES.AUTH.SIGNUP.CREATE_USER_INFO, { email });
      } catch (error: any) {
        logger.error("Error during navigation", error);
        showInfoModal("Error", "Unable to reset password. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      logger.warn("Password validation failed", {
        passwordsMatch,
        isPasswordValid,
        isConfirmPasswordValid,
      });
      showInfoModal("Invalid Password", "Please check your inputs again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPasswords = async () => {
      logger.debug("Loading saved passwords from storage");
      const savedPassword = await SecureStore.getItemAsync("signup_password");
      const savedConfirm = await SecureStore.getItemAsync(
        "signup_confirm_password",
      );

      if (savedPassword || savedConfirm) {
        logger.log("Restored saved passwords from storage");
        if (savedPassword) setPassword(savedPassword);
        if (savedConfirm) setConfirmPassword(savedConfirm);
      }
    };
    loadPasswords();
  }, []);

  useEffect(() => {
    const savePasswords = async () => {
      await SecureStore.setItemAsync("signup_password", password);
      await SecureStore.setItemAsync(
        "signup_confirm_password",
        confirmPassword,
      );
    };
    savePasswords();
  }, [password, confirmPassword]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <View className="flex-1 p-6">
        <Text style={typography["h1-bold"]} className="mt-4 mb-2">
          Set your password
        </Text>

        <Text
          style={typography["subheader"]}
          className="mb-6 text-black leading-normal"
        >
          Enter a secure password to protect your account.
        </Text>

        <View className="w-full mb-2">
          <PasswordInput
            value={password}
            onChangeText={handlePasswordChange}
            isVisible={isPasswordVisible}
            onToggleVisibility={togglePasswordVisibility}
            hasError={password.length > 0 && !isPasswordValid}
            label="Set password"
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
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            isVisible={isPasswordVisible}
            onToggleVisibility={togglePasswordVisibility}
            hasError={
              confirmPassword.length > 0 &&
              (!passwordsMatch || !isConfirmPasswordValid)
            }
            label="Confirm password"
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
          onPress={handleNextPress}
          loading={loading}
          disabled={!isNextButtonEnabled}
          title="Next"
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
};

export default CreatePassword;
