/* eslint-disable react/no-unescaped-entities */

import { EmailInput } from "@/components/auth/emailInput";
import { GoogleSignInButton } from "@/components/auth/googleSignInButton";
import { ConsentModal } from "@/components/auth/modal/consentModal";
import { Checkbox } from "@/components/shared/checkbox";
import { Divider } from "@/components/shared/divider";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { useAuth } from "@/contexts/AuthContext";
import useFetch from "@/hooks/useFetch";
import { cleanInput, validateEmail } from "@/utils/validation";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler, Text, View } from "react-native";
import "../../globals.css";

const USER_INFO_STORAGE_KEY = "temp_user_info";
const SSO_INFO_STORAGE_KEY = "sso_temp_user_info";

const STORAGE_KEYS = [
  USER_INFO_STORAGE_KEY,
  SSO_INFO_STORAGE_KEY,
  "signup_email",
  "verified_email",
  "signup_password",
  "signup_confirm_password",
  "fromGoogle",
  "firebaseToken",
];

const CreateAccount = () => {

const [email, setEmail] = useState("");
  const [isCheckedTS, setIsCheckedTS] = useState(false);
  const [isCheckedPP, setIsCheckedPP] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isFirstMount, setIsFirstMount] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [currentConsentType, setCurrentConsentType] = useState<
    "TS" | "PP" | null
  >(null);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  const { googleSignInAndVerify } = useAuth();

  const isNextButtonEnabled = email.length > 0 && isEmailValid;
  const isGoogleButtonEnabled = isCheckedTS && isCheckedPP;

  const {
    refetch: checkEmailExists
  } = useFetch('/api/users', {
    method: 'GET',
    autoFetch: false,
    withAuth: false
  });

  const {
    refetch: checkNeedsOnboarding
  } = useFetch('/api/auth/onboarding-status', {
    method: 'GET',
    autoFetch: false,
    withAuth: false
  });
  
  const handleEmailChange = (value: string) => {
    const cleanText = cleanInput(value);
    setEmail(cleanText);

    if (cleanText.trim() === "") {
      setEmailError("");
      setIsEmailValid(false);
      return;
    }

    if (validateEmail(cleanText)) {
      setEmailError("");
      setIsEmailValid(true);
    } else {
      setEmailError("Email is invalid");
      setIsEmailValid(false);
    }
  };
  
  const handleCheckboxToggleTS = () => {
    if (!isCheckedTS) {
      setCurrentConsentType("TS");
      setShowConsentModal(true);
    } else {
      setIsCheckedTS(false);
    }
  };
  
  const handleCheckboxTogglePP = () => {
    if (!isCheckedPP) {
      setCurrentConsentType("PP");
      setShowConsentModal(true);
    } else {
      setIsCheckedPP(false);
    }
  };

  const handleConsentAccept = () => {
    if (currentConsentType === "TS") setIsCheckedTS(true);
    if (currentConsentType === "PP") setIsCheckedPP(true);
    setHasScrolledToEnd(false);
    setShowConsentModal(false);
  };

  const handleConsentDecline = () => {
    setHasScrolledToEnd(false);
    setShowConsentModal(false);
  };

  const handleNextPress = async () => {
    if (!isNextButtonEnabled) {
      setEmailError("Email is invalid");
      return;
    }

    if (!isCheckedTS || !isCheckedPP) {
      Alert.alert(
        "Terms Required",
        "Please agree to the Terms of Service and Privacy Policy to continue.",
      );
      return;
    }

    setLoading(true);

    try {
      const savedEmail = await SecureStore.getItemAsync("signup_email");
      const verifiedEmail = await SecureStore.getItemAsync("verified_email");

      if (savedEmail && savedEmail !== email) {
        console.log("Email changed, clearing related data");
        await Promise.all([
          SecureStore.deleteItemAsync(USER_INFO_STORAGE_KEY),
          SecureStore.deleteItemAsync("signup_password"),
          SecureStore.deleteItemAsync("signup_confirm_password"),
          SecureStore.deleteItemAsync("verified_email"),
          SecureStore.deleteItemAsync("fromGoogle"),
        ]);
      }

      await SecureStore.setItemAsync("signup_email", email);
      await SecureStore.setItemAsync("fromGoogle", "false");

      if (verifiedEmail === email) {
        console.log("Email already verified, skipping OTP");
        router.push("/(auth)/signup/createPassword");
        return;
      }

      const response = await checkEmailExists({
        params: { email }
      });

      if (!response || response.error) {
        console.error("Error checking email existence:", response?.error);
        Alert.alert("Error", "Unable to verify email. Please try again.");
        return;
      }

      const emailExists = response?.data?.available === false;

      if (emailExists) {
        Alert.alert("Error", "This email is already registered. Please use a different email.");
        return;
      }

      await SecureStore.setItemAsync("signup_email", email);
      router.push({
        pathname: "/(auth)/signup/emailOTP",
        params: { email },
      });
    } catch (error) {
      console.error("Error in handleNextPress:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleGooglePress = async () => {
    if (!isGoogleButtonEnabled || loading) return;

    setLoading(true);

    try {
      await Promise.all([
        SecureStore.deleteItemAsync(USER_INFO_STORAGE_KEY),
        SecureStore.deleteItemAsync(SSO_INFO_STORAGE_KEY),
      ]);

      const { userData } = await googleSignInAndVerify();

      if (!userData?.email) {
        Alert.alert("Error", "Failed to retrieve email from Google. Please try again.");
        return;
      }

      const email = userData.email.trim().toLowerCase();

      const response = await checkNeedsOnboarding({
        params: { email }
      });

      if (!response || response.error) {
        console.error("Error checking onboarding status:", response?.error);
        Alert.alert("Error", "Unable to proceed with Google Sign-In. Please try again.");
        return;
      };

      const needsOnboarding = response?.data?.needsOnboarding;

      if (needsOnboarding) {
        if (email) {
          const userInfoFromGoogle = {
            email: userData.email ?? "",
            firstName: userData.firstName ?? "",
            lastName: userData.lastName ?? "",
            token: userData.token ?? ""
          };

          await SecureStore.setItemAsync(
            SSO_INFO_STORAGE_KEY,
            JSON.stringify(userInfoFromGoogle)
          );

          await SecureStore.setItemAsync("fromGoogle", "true");

          console.log("Google Sign-In successful");
        };

        router.push({
          pathname: "/(auth)/signup/createUserInfo",
          params: { email },
        });
      } else {
        router.replace("/(tabs)/(home)");
      }

    } catch (error) {
      console.error("Error clearing storage before Google Sign-In:", error);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    const loadSavedEmail = async () => {
      if (!isFirstMount) {
        const savedEmail = await SecureStore.getItemAsync("signup_email");
        if (savedEmail) {
          setEmail(savedEmail);
          const isValid = validateEmail(savedEmail);
          setIsEmailValid(isValid);
          if (!isValid) {
            setEmailError("Email is invalid");
          } else {
            setEmailError("");
          }
        }
      }
    };
    loadSavedEmail();
  }, [isFirstMount]);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        Alert.alert("Go back?", "Your progress will be deleted and cleared.", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes",
            style: "destructive",
            onPress: async () => {
              await Promise.all(
                STORAGE_KEYS.map((key) => SecureStore.deleteItemAsync(key))
              );
              router.back();
            },
          },
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [])
  );

  return (
    <View className="flex-1 bg-white px-[16px] pb-[34px] w-screen justify-between h-screen">
      <View className="mt-[34px] flex-1 items-start">
        <Text className="text-black font-bold text-3xl mb-[20px] pl-2">
          Create your account
        </Text>

        <EmailInput
          value={email}
          onChangeText={handleEmailChange}
          error={emailError}
        />

        <Divider />

        <GoogleSignInButton
          onPress={handleGooglePress}
          disabled={!isGoogleButtonEnabled || loading}
        />
      </View>

      <View className="w-full">
        <Checkbox
          checked={isCheckedTS}
          onPress={handleCheckboxToggleTS}
          label={
            <Text className="text-base text-black leading-[20px]">
              I have read and agreed to all terms and conditions set with
              Nurtura's{" "}
                <Text 
                  onPress={() => {
                    setCurrentConsentType("TS");
                    setShowConsentModal(true);
                  }}
                  className="text-base font-semibold text-primary">
                  Terms of Service
                </Text>
            </Text>
          }
        />

        <View className="mb-4 mt-3">
          <Checkbox
            checked={isCheckedPP}
            onPress={handleCheckboxTogglePP}
            label={
              <>
                <Text className="text-base text-black leading-normal">
                  I acknowledge and agree to Nurtura's {" "}
                  <Text 
                    onPress={() => {
                      setCurrentConsentType("PP");
                      setShowConsentModal(true);
                    }}
                    className="text-base font-semibold text-primary">
                     Privacy Policy
                  </Text>
                  {""} regarding the collection and use of my personal data.
                </Text>
              </>
            }
          />
        </View>

        <PrimaryButton
          onPress={handleNextPress}
          loading={loading}
          disabled={!isNextButtonEnabled || loading}
          title="Next"
        />
      </View>

      <ConsentModal
        visible={showConsentModal}
        onClose={handleConsentDecline}
        onAccept={handleConsentAccept}
        type={currentConsentType}
        hasScrolledToEnd={hasScrolledToEnd}
        onScrollEnd={() => setHasScrolledToEnd(true)}
      />
    </View>
  );
};

export default CreateAccount;
