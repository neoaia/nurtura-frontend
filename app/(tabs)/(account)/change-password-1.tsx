import { typography } from "@/assets/fonts/Text";
import { OTPInput } from "@/components/auth/otpInput";
import { ResendCode } from "@/components/auth/resendCode";
import { PrimaryButton } from "@/components/shared/primaryButton";
import useFetch from "@/hooks/useFetch";
import { authService } from "@/services/authService";
import { createLogger } from "@/utils/logger";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";

const logger = createLogger("ChangePassword1");

export default function ChangePassword1() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  const [timer, setTimer] = useState(60);
  const [userEmail, setUserEmail] = useState<string>("");

  const inputs = useRef<(TextInput | null)[]>([]);

  const allFilled = otp.every((digit) => digit !== "");

  const { refetch: sendOtp } = useFetch("/api/auth/otp/email-reset", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: verifyOtp } = useFetch("/api/auth/otp/verify", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const email = await SecureStore.getItemAsync("user_email");
        if (email) {
          setUserEmail(email);
          logger.log("User email loaded:", email);
        } else {
          Alert.alert(
            "Error",
            "Unable to retrieve user email. Please log in again.",
          );
          router.back();
        }
      } catch (error) {
        logger.error("Error loading user email", error);
        Alert.alert("Error", "Failed to load user information.");
      }
    };
    loadUserEmail();
  }, []);

  const handleSendOtp = useCallback(
    async (isResend = false) => {
      if (!userEmail) return;

      setLoading(true);
      try {
        const response = await authService.sendOtp(sendOtp, userEmail);

        if (!response.success) {
          Alert.alert(
            "Error",
            response.message || "Failed to send OTP. Please try again.",
          );
          setLoading(false);
          return;
        }

        if (isResend) {
          Alert.alert("Success", "OTP has been resent to your email.");
          setTimer(60);
        }

        logger.log("OTP sent successfully");
      } catch (err: any) {
        logger.error("Error sending OTP", err);
        Alert.alert("Error", err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    },
    [userEmail, sendOtp],
  );

  useEffect(() => {
    if (userEmail) {
      handleSendOtp(false);
    }
  }, [userEmail]);

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

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (isOtpInvalid) {
      setIsOtpInvalid(false);
    }

    if (text && index < 4) {
      inputs.current[index + 1]?.focus();
    }

    const filled = newOtp.every((digit) => digit !== "");
    if (filled) {
      const userCode = newOtp.join("");
      submitOtp(userCode);
    }
  };

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
    const firstEmptyIndex = otp.findIndex((v) => v === "");

    if (firstEmptyIndex !== -1 && index > firstEmptyIndex) {
      inputs.current[firstEmptyIndex]?.focus();
    }
  };

  const submitOtp = async (userCode: string) => {
    setLoading(true);
    setIsOtpInvalid(false);

    try {
      const response = await authService.verifyOtp(
        verifyOtp,
        userEmail,
        userCode,
        "email-reset",
      );

      if (!response.success) {
        setIsOtpInvalid(true);
        setOtp(["", "", "", "", ""]);
        inputs.current[0]?.focus();
        Alert.alert("Error", "Invalid OTP. Please try again.");
        setLoading(false);
        return;
      }

      logger.log("OTP verified successfully");

      await SecureStore.setItemAsync(
        "change_password_verified_email",
        userEmail,
      );

      router.push("/(tabs)/(account)/change-password-2");
    } catch (error) {
      logger.error("Error verifying OTP:", error);
      Alert.alert("Error", "Failed to verify OTP. Please try again.");
      setLoading(false);
    }
  };

  const handleResendPress = () => {
    if (timer > 0 || loading) return;
    setOtp(["", "", "", "", ""]);
    handleSendOtp(true);
  };

  const handleNextPress = () => {
    if (!allFilled || loading) return;
    const userCode = otp.join("");
    submitOtp(userCode);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 34 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mb-3 pl-2">
          Enter one-time code
        </Text>
        <Text
          style={typography["subheader"]}
          className="pl-2 mb-6 text-black leading-normal"
        >
          Enter the 5 digit code that was sent to your email address:{" "}
          <Text className="text-primary font-bold">{userEmail}</Text>
        </Text>
        <OTPInput
          otp={otp}
          onChangeOtp={handleChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          inputRefs={inputs}
          isInvalid={isOtpInvalid}
          disabled={loading}
        />
        {isOtpInvalid && (
          <Text className="text-[#E65656] text-base mb-6 pl-2">
            Invalid OTP. Please try again.
          </Text>
        )}
        <ResendCode
          onResend={handleResendPress}
          timer={timer}
          loading={loading}
        />
      </ScrollView>
      <View className="px-4 pb-9">
        <PrimaryButton
          title={loading ? "Verifying..." : "Next"}
          onPress={handleNextPress}
          disabled={!allFilled || loading}
        />
      </View>
    </View>
  );
}
