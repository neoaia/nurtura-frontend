import useFetch from '@/hooks/useFetch';
import { cleanInput, validateEmail } from '@/utils/validation';
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ForgotPassword1 = () => {
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [email, setEmail] = useState("");
  const [isFirstMount, setIsFirstMount] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const isNextButtonEnabled = email.length > 0 && isEmailValid;

  const {
    refetch: checkEmailExists
  } = useFetch('/api/users', {
    method: 'GET',
    autoFetch: false,
    withAuth: false
  });

  const {
    refetch: checkSignInMethods
  } = useFetch('/api/auth/providers', {
    method: 'GET',
    autoFetch: false,
    withAuth: false
  });

  const isEmailAlreadyRegistered = async (email: string): Promise<boolean> => {
    try {
      const response = await checkEmailExists({
        params: { email }
      });

      if (!response || response.error) {
        console.error("Error checking email existence:", response?.error);
        setEmailError("Unable to verify email. Please try again.");
        return false;
      }

      return response?.data?.available === false;
    } catch (error) {
      console.error("Error checking email existence:", error);
      setEmailError("Unable to verify email. Please try again.");
      return false;
    }
  };

  const emailProvider = async (email: string): Promise<string[]> => {
    try {
      const response = await checkSignInMethods({
        params: { email }
      });

      if (!response || response.error) {
        console.error("Error checking sign-in methods:", response?.error);
        return [];
      }

      return response?.data?.providers || [];
    } catch (error) {
      console.error("Error checking sign-in methods:", error);
      return [];
    }
  };

  const validateEmailFormat = (email: string): string[] => {
    const errors: string[] = [];
    
    if (!email) {
      errors.push("Email is required");
      return errors;
    }

    if (!validateEmail(email)) {
      errors.push("Please enter a valid email address");
    }

    if (email.length > 254) {
      errors.push("Email address is too long");
    }

    const [localPart, domain] = email.split('@');
    if (localPart?.length > 64) {
      errors.push("Email local part is too long");
    }

    return errors;
  };

  const handleEmailChange = (value: string) => {
    const cleanValue = cleanInput(value);
    setEmail(cleanValue);
    setEmailError("");
    setValidationErrors([]);
    
    const errors = validateEmailFormat(cleanValue);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setIsEmailValid(true);
    } else {
      setIsEmailValid(false);
    }
  };

  useEffect(() => {
    const clearStorageOnFirstMount = async () => {
      if (isFirstMount) {
        console.log('Clearing storage on first mount');
        try {
          await SecureStore.deleteItemAsync("forgot_password_email");
          await SecureStore.deleteItemAsync("forgot_password_verified_email");
          await SecureStore.deleteItemAsync("forgot_password_new_password");
          await SecureStore.deleteItemAsync("forgot_password_confirm_password");
        } catch (error) {
          console.error('Error clearing storage:', error);
        }
        setIsFirstMount(false);
      }
    };

    clearStorageOnFirstMount();
  }, [isFirstMount]);

  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await SecureStore.getItemAsync("forgot_password_email");
        if (savedEmail) {
          console.log('Loading saved email:', savedEmail);
          setEmail(savedEmail);
          const errors = validateEmailFormat(savedEmail);
          if (errors.length === 0) {
            setIsEmailValid(true);
          }
        }
      } catch (error) {
        console.error('Error loading saved email:', error);
      }
    };
    loadSavedEmail();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        Alert.alert(
          "Go back?", 
          "Your process will be deleted and cleared.", 
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Yes",
              style: "destructive",
              onPress: async () => {
                console.log('User confirmed going back');
                try {
                  await SecureStore.deleteItemAsync("forgot_password_email");
                  await SecureStore.deleteItemAsync("forgot_password_verified_email");
                  await SecureStore.deleteItemAsync("forgot_password_new_password");
                  await SecureStore.deleteItemAsync("forgot_password_confirm_password");
                } catch (error) {
                  console.error('Error clearing storage on back:', error);
                }
                router.back();
              },
            },
          ]
        );

        return true;
      };

      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

      return () => backHandler.remove();
    }, [])
  );

  const handleNextPress = async () => {
    if (!isNextButtonEnabled) return;

    setLoading(true);
    setEmailError("");
    console.log(`Starting forgot password process for: ${email}`);

    try {
      const formatErrors = validateEmailFormat(email);
      if (formatErrors.length > 0) {
        setEmailError(formatErrors[0]);
        return;
      }

      console.log('Checking if email exists');
      const emailExists = await isEmailAlreadyRegistered(email);
      
      if (!emailExists) {
        setEmailError("We couldn't find an account with this email address.");
        return;
      }

      console.log('Email exists, proceeding to check providers');

      const providers = await emailProvider(email);
      console.log('Available providers:', providers);

      console.log('Saving email to secure storage');
      await SecureStore.setItemAsync("forgot_password_email", email);

      if (providers.includes('google') && providers.length === 1) {
        Alert.alert(
          "Google Account", 
          "This email is associated with a Google account. Please reset your password using Google instead.",
          [
            { text: "OK", style: "default" },
            { 
              text: "Use Google", 
              onPress: () => {
                router.push('/(auth)/login');
              }
            }
          ]
        );
        return;
      }

      console.log('All checks passed, navigating to next step');
      router.push({
          pathname: "/(auth)/forgetpassword/forgotPassword2",
          params: { email },
        });

    } catch (error) {
      console.error('Unexpected error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Network')) {
          setEmailError("Network error. Please check your connection and try again.");
        } 
        
      } else {
        setEmailError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

    return (
    <View className="flex-1 bg-white px-[16px] pb-[34px] w-screen justify-between h-screen">
      <View className="mt-[34px] flex-1 items-start">
        <Text className="text-black font-bold text-3xl mb-[20px] pl-2">
          Find your account
        </Text>

        <View
          className={`w-[100%] pt-2 px-3 border-[2px] rounded-[12px] bg-white mb-[10px] ${
            emailError ? "border-[#ef8d8d]" : "border-[#919191]"
          }`}
        >
          <Text className="text-primary text-base pt-[4px] pl-[4px]">
            Email
          </Text>

          <TextInput
            className="text-black text-xl"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={handleEmailChange}
            value={email}
          />
        </View>

        {/* 🔹 Error message */}
        {emailError.length > 0 && (
          <Text className="text-[#E65656] text-base mt-1 pl-2">
            {emailError}
          </Text>
        )}
      </View>

      <View className="w-full">
        <TouchableOpacity
          onPress={handleNextPress}
          className={`w-full p-6 rounded-[12px] mt-2 flex items-center ${
            isNextButtonEnabled ? "bg-primary" : "bg-[#919191]"
          }`}
          disabled={!isNextButtonEnabled || loading}
        >
          <Text className="text-white text-xl font-bold">
            {loading ? "Loading..." : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForgotPassword1;