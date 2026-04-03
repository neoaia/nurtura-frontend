import { typography } from "@/assets/fonts/Text";
import { OTPInput } from "@/components/auth/otpInput";
import { ResendCode } from "@/components/auth/resendCode";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { useBackWarning } from "@/hooks/shared/useBackWarning";
import useFetch from "@/hooks/useFetch";
import { authService } from "@/services/authService";
import { logger } from "@/utils/logger";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TextInput,
    TextInputKeyPressEventData,
    View,
} from "react-native";

export default function UpdateEmailScreen1() {
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const inputs = useRef<(TextInput | null)[]>([]);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string>("");

  const allFilled = otp.every((digit) => digit !== "");
  const hasStartedOtp = otp.some((digit) => digit !== "");

  const { showModal, handleConfirm, handleCancel } =
    useBackWarning(!hasStartedOtp);

  const { refetch: sendOtp } = useFetch("/auth/otp/registration", {
    method: "POST",
    autoFetch: false,
    withAuth: false,
  });

  const { refetch: verifyOtp } = useFetch("/auth/otp/verify", {
    method: "POST",
    autoFetch: false,
    withAuth: false,
  });

  useEffect(() => {
    const loadCurrentEmail = async () => {
      try {
        const email = await SecureStore.getItemAsync("user_email");
        if (email) {
          setCurrentEmail(email);
          logger.log("Current email loaded:", email);
        } else {
          Alert.alert(
            "Error",
            "Unable to retrieve your email. Please log in again.",
          );
          router.back();
        }
      } catch (error) {
        logger.error("Error loading current email:", error);
        Alert.alert("Error", "Failed to load user information.");
      }
    };
    loadCurrentEmail();
  }, []);

  const handleSendOtp = useCallback(
    async (isResend = false) => {
      if (!currentEmail) return;

      setIsLoading(true);
      try {
        const response = await authService.sendOtp(sendOtp, currentEmail);

        if (!response.success) {
          Alert.alert(
            "Error",
            response.message || "Failed to send OTP. Please try again.",
          );
          setIsLoading(false);
          return;
        }

        if (isResend) {
          Alert.alert("Success", "OTP has been resent to your email.");
          setTimer(60);
        }

        logger.log("OTP sent to current email successfully");
      } catch (err: any) {
        Alert.alert("Error", err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    },
    [currentEmail, sendOtp],
  );

  // Send OTP once email is loaded
  useEffect(() => {
    if (currentEmail) {
      handleSendOtp(false);
    }
  }, [currentEmail]);

  // Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const submitOtp = async (enteredOtp: string) => {
    if (!currentEmail) return;
    setIsLoading(true);

    try {
      const response = await authService.verifyOtp(
        verifyOtp,
        currentEmail,
        enteredOtp,
        "registration",
      );

      if (!response.success) {
        setIsOtpInvalid(true);
        setOtp(["", "", "", "", ""]);
        inputs.current[0]?.focus();
        Alert.alert(
          "Error",
          response.message || "Invalid OTP. Please try again.",
        );
        return;
      }

      logger.log("Current email verified, proceeding to enter new email...");

      // Navigate to screen 2 where user enters their new email
      router.push("/(tabs)/(account)/update-email-2");
    } catch (error) {
      setIsOtpInvalid(true);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      logger.error("OTP verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  //#region Button Handlers
  const handleResendPress = () => {
    if (timer > 0 || isLoading) return;
    setOtp(["", "", "", "", ""]);
    handleSendOtp(true);
  };

  const handleNextPress = () => {
    if (!allFilled || isLoading) return;
    const enteredOtp = otp.join("");
    submitOtp(enteredOtp);
  };
  //#endregion

  //#region OTP Handlers
  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleFocus = (index: number) => {
    const firstEmpty = otp.findIndex((v) => v === "");
    if (firstEmpty !== -1 && index > firstEmpty) {
      inputs.current[firstEmpty]?.focus();
    }
  };

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (isOtpInvalid) setIsOtpInvalid(false);

    if (text && index < 4) {
      inputs.current[index + 1]?.focus();
    }

    const filled = newOtp.every((digit) => digit !== "");
    if (filled) {
      submitOtp(newOtp.join(""));
    }
  };
  //#endregion

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 34 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mb-3 pl-2">
          Verify your identity
        </Text>
        <Text
          style={typography["subheader"]}
          className="pl-2 mb-6 text-black leading-normal"
        >
          To change your email, we first need to confirm it's you. Enter the
          5-digit code sent to your current email address:{" "}
          <Text style={typography["subheader-bold"]} className="text-primary">
            {currentEmail}
          </Text>
        </Text>

        <OTPInput
          otp={otp}
          onChangeOtp={handleChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          inputRefs={inputs}
          isInvalid={isOtpInvalid}
          disabled={isLoading}
        />

        {isOtpInvalid && (
          <Text
            style={typography["subheader"]}
            className="text-[#E65656] mb-[26px] pl-2"
          >
            Invalid OTP. Please try again.
          </Text>
        )}

        <ResendCode
          onResend={handleResendPress}
          timer={timer}
          loading={isLoading}
        />
      </ScrollView>

      <View className="px-4 pb-9">
        <PrimaryButton
          title="Next"
          onPress={handleNextPress}
          disabled={!allFilled || isLoading}
          loading={isLoading}
        />
      </View>
      <ConfirmationModal
        isVisible={showModal}
        title="Your progress will be lost"
        message="Are you sure you want to cancel?"
        confirmText="Continue"
        onConfirm={handleConfirm}
        cancelText="Cancel"
        onCancel={handleCancel}
      />
    </View>
  );
}
