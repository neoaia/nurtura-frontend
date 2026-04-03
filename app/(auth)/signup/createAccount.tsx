/* eslint-disable react/no-unescaped-entities */

import { typography } from "@/assets/fonts/Text";
import { EmailInput } from "@/components/auth/emailInput";
import { GoogleSignInButton } from "@/components/auth/googleSignInButton";
import { ConsentModal } from "@/components/auth/modal/consentModal";
import { Checkbox } from "@/components/shared/checkbox";
import { Divider } from "@/components/shared/divider";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { useAuth } from "@/contexts/AuthContext";
import useFetch from "@/hooks/useFetch";
import { authService } from "@/services/authService";
import { createLogger } from "@/utils/logger";
import { cleanInput, validateEmail } from "@/utils/validation";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";
import { Alert, BackHandler, Text, View } from "react-native";
import "../../globals.css";

const logger = createLogger("CreateAccount");

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

  const { refetch: checkEmailExists } = useFetch("/users/exists", {
    method: "GET",
    autoFetch: false,
    withAuth: false,
  });

  const { refetch: checkNeedsOnboarding } = useFetch(
    "/auth/onboarding-status",
    {
      method: "GET",
      autoFetch: false,
      withAuth: false,
    },
  );

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
    logger.log(`Consent accepted: ${currentConsentType}`);
    if (currentConsentType === "TS") setIsCheckedTS(true);
    if (currentConsentType === "PP") setIsCheckedPP(true);
    setHasScrolledToEnd(false);
    setShowConsentModal(false);
  };

  const handleConsentDecline = () => {
    logger.log(`Consent declined: ${currentConsentType}`);
    setHasScrolledToEnd(false);
    setShowConsentModal(false);
  };

  const handleNextPress = async () => {
    logger.log("Next button pressed");

    if (!isNextButtonEnabled) {
      logger.warn("Next button disabled - invalid email");
      setEmailError("Email is invalid");
      return;
    }

    if (!isCheckedTS || !isCheckedPP) {
      logger.warn("Terms not accepted", { isCheckedTS, isCheckedPP });
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
      logger.debug("Storage check", { savedEmail, verifiedEmail });

      if (savedEmail && savedEmail !== email) {
        logger.log("Email changed, clearing related storage");
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
        logger.log("Email already verified, navigating to createPassword");
        router.push("/(auth)/signup/createPassword");
        return;
      }

      const emailResponse = await authService.emailAvailable(
        checkEmailExists,
        email,
      );

      if (!emailResponse.success) {
        Alert.alert("Error", "Unable to verify email. Please try again.");
        return;
      }

      if (!emailResponse.available) {
        Alert.alert(
          "Error",
          "This email is already registered. Please use a different email.",
        );
        return;
      }

      logger.log("Navigating to emailOTP");
      await SecureStore.setItemAsync("signup_email", email);
      router.push({
        pathname: "/(auth)/signup/emailOTP",
        params: { email },
      });
    } catch (error) {
      logger.error("Unexpected error in handleNextPress", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePress = async () => {
    logger.log("Google Sign-In button pressed");

    if (!isGoogleButtonEnabled || loading) {
      logger.warn("Google button disabled", { isGoogleButtonEnabled, loading });
      return;
    }

    setLoading(true);

    try {
      logger.log("Clearing previous SSO storage");
      await Promise.all([
        SecureStore.deleteItemAsync(USER_INFO_STORAGE_KEY),
        SecureStore.deleteItemAsync(SSO_INFO_STORAGE_KEY),
      ]);

      logger.log("Starting Google Sign-In flow");
      const { userData } = await googleSignInAndVerify();

      if (!userData?.email) {
        logger.warn("No email returned from Google");
        Alert.alert(
          "Error",
          "Failed to retrieve email from Google. Please try again.",
        );
        return;
      }

      const email = userData.email.trim().toLowerCase();
      logger.debug("Google user data", {
        email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });

      const onboardingResponse = await authService.onboardingStatus(
        checkNeedsOnboarding,
        email,
      );

      if (!onboardingResponse.success) {
        Alert.alert(
          "Error",
          "Unable to proceed with Google Sign-In. Please try again.",
        );
        return;
      }

      if (onboardingResponse.needsOnboarding) {
        logger.log("User needs onboarding, saving SSO data");
        const userInfoFromGoogle = {
          email: userData.email ?? "",
          firstName: userData.firstName ?? "",
          lastName: userData.lastName ?? "",
          token: userData.token ?? "",
        };

        await SecureStore.setItemAsync(
          SSO_INFO_STORAGE_KEY,
          JSON.stringify(userInfoFromGoogle),
        );
        await SecureStore.setItemAsync("fromGoogle", "true");

        logger.log("Navigating to createUserInfo");
        router.push({
          pathname: "/(auth)/signup/createUserInfo",
          params: { email },
        });
      } else {
        logger.log("User already onboarded, navigating to home");
        router.replace("/(tabs)/(home)");
      }
    } catch (error) {
      logger.error("Error during Google Sign-In", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSavedEmail = async () => {
      if (!isFirstMount) {
        logger.debug("Loading saved email from storage");
        const savedEmail = await SecureStore.getItemAsync("signup_email");
        if (savedEmail) {
          logger.log(`Loaded saved email: ${savedEmail}`);
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
        logger.log("Back button pressed");
        Alert.alert("Go back?", "Your progress will be deleted and cleared.", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes",
            style: "destructive",
            onPress: async () => {
              logger.log("Clearing all storage and navigating back");
              await Promise.all(
                STORAGE_KEYS.map((key) => SecureStore.deleteItemAsync(key)),
              );
              router.back();
            },
          },
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      return () => backHandler.remove();
    }, []),
  );

  return (
    <View className="flex-1 bg-white px-4 pb-8 w-screen justify-between h-screen">
      <View className="mt-[34px] flex-1 items-start">
        <Text style={typography["h1-bold"]} className="text-black mb-6 pl-2">
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
            <Text
              style={typography["label"]}
              className="text-black text-justify"
            >
              I have read and agreed to all terms and conditions set with
              Nurtura's{" "}
              <Text
                onPress={() => {
                  setCurrentConsentType("TS");
                  setShowConsentModal(true);
                }}
                style={typography["label-bold"]}
                className=" text-primary"
              >
                Terms of Service
              </Text>
              .
            </Text>
          }
        />

        <View className="mb-4 mt-3">
          <Checkbox
            checked={isCheckedPP}
            onPress={handleCheckboxTogglePP}
            label={
              <>
                <Text
                  style={typography["label"]}
                  className=" text-black text-justify"
                >
                  I acknowledge and agree to Nurtura's{" "}
                  <Text
                    onPress={() => {
                      setCurrentConsentType("PP");
                      setShowConsentModal(true);
                    }}
                    style={typography["label-bold"]}
                    className=" text-primary"
                  >
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
