import { PasswordInput } from "@/components/auth/passwordInput";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { createLogger } from "@/utils/logger";
import { isStrongPassword, validatePassword } from "@/utils/validation";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";

const logger = createLogger('CreatePassword');

const CreatePassword = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
  }

  const handlePasswordChange = (text: string) => {
    setPassword(text.replace(/\s/g, ""));
  }

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text.replace(/\s/g, ""));
  }

  const handleNextPress = async () => {
    logger.log('Next button pressed');
    setLoading(true);

    if (passwordsMatch && isPasswordValid && isConfirmPasswordValid) {
      try {
        logger.log('Password validation passed, navigating to createUserInfo');
        router.push({
          pathname: "/(auth)/signup/createUserInfo",
          params: { email }
        });
      } catch (error: any) {
        logger.error('Error during navigation', error);
        Alert.alert("Error", "Unable to reset password. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      logger.warn('Password validation failed', { 
        passwordsMatch, 
        isPasswordValid, 
        isConfirmPasswordValid 
      });
      Alert.alert("Invalid Password", "Please check your inputs again.");
      setLoading(false);
    }
  }

  useEffect(() => {
    const loadPasswords = async () => {
      logger.debug('Loading saved passwords from storage');
      const savedPassword = await SecureStore.getItemAsync("signup_password");
      const savedConfirm = await SecureStore.getItemAsync("signup_confirm_password");

      if (savedPassword || savedConfirm) {
        logger.log('Restored saved passwords from storage');
        if (savedPassword) setPassword(savedPassword);
        if (savedConfirm) setConfirmPassword(savedConfirm);
      }
    };
    loadPasswords();
  }, []);

  useEffect(() => {
    const savePasswords = async () => {
      await SecureStore.setItemAsync("signup_password", password);
      await SecureStore.setItemAsync("signup_confirm_password", confirmPassword);
    };
    savePasswords();
  }, [password, confirmPassword]);

  return (
    <View className="flex-1 bg-white px-[16px] pb-[34px] w-screen justify-between h-screen">
      <View className="mt-[34px] flex-1 items-start">
        <Text className="text-black font-bold text-3xl pr-[110px] mb-[13px] pl-2">
          Set your password
        </Text>

        <Text className="mb-[20px] text-base text-gray-700 leading-normal pl-2">
          Enter a secure password to protect your account.
        </Text>

        <View className="w-full mb-[5px]">
          <PasswordInput
            value={password}
            onChangeText={handlePasswordChange}
            isVisible={isPasswordVisible}
            onToggleVisibility={togglePasswordVisibility}
            hasError={password.length > 0 && !isPasswordValid}
            label="Set password"
          />

          {!isPasswordValid && password.length > 0 && (
            <Text className="text-[#E65656] text-base mb-[10px] pl-2">
              Password must have 8+ chars, uppercase, number & symbol.
            </Text>
          )}
        </View>

        <View className="w-full mb-[20px]">
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
            <Text className="text-[#E65656] text-base mb-[10px] pl-2">
              Passwords do not match.
            </Text>
          )}

          {!isConfirmPasswordValid &&
            confirmPassword.length > 0 &&
            passwordsMatch && (
              <Text className="text-[#E65656] text-base mb-[10px] pl-2">
                Password must have 8+ chars, uppercase, number & symbol.
              </Text>
            )}
        </View>
      </View>

      <View className="w-full">
        <PrimaryButton
          onPress={handleNextPress}
          loading={loading}
          disabled={!isNextButtonEnabled}
          title="Next"
        />
      </View>
    </View>
  );
};

export default CreatePassword;