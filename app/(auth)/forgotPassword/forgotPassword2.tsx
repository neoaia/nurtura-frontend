import { typography } from "@/assets/fonts/Text";
import { OTPInput } from "@/components/auth/otpInput";
import { ResendCode } from "@/components/auth/resendCode";
import { InfoModal } from "@/components/modals/infoModal";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { useAuth } from "@/contexts/AuthContext";
import useFetch from "@/hooks/useFetch";
import { authService } from "@/services/authService";
import { createLogger } from "@/utils/logger";
import { NavigationService, ROUTES } from "@/utils/navigationUtils";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const logger = createLogger("ForgotPassword2");

const ForgotPassword2 = () => {
  const { email } = useLocalSearchParams();

  const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  const [timer, setTimer] = useState(60);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalTitle, setInfoModalTitle] = useState("");
  const [infoModalMessage, setInfoModalMessage] = useState("");

  const showInfoModal = (title: string, message: string) => {
    setInfoModalTitle(title);
    setInfoModalMessage(message);
    setInfoModalVisible(true);
  };

  const navService = new NavigationService(router);

  const inputs = useRef<(TextInput | null)[]>([]);

  const { signInWithTemporaryToken } = useAuth();

  const allFilled = otp.every((digit) => digit !== "");

  const { refetch: sendOtp } = useFetch("/auth/otp/forgot-password", {
    method: "POST",
    autoFetch: false,
    withAuth: false,
  });

  const { refetch: verifyOtp } = useFetch("/auth/otp/verify", {
    method: "POST",
    autoFetch: false,
    withAuth: false,
  });

  const handleSendOtp = useCallback(
    async (isResend = false) => {
      if (!email) return;

      setLoading(true);
      try {
        const response = await authService.sendOtp(sendOtp, email as string);

        if (!response.success) {
          showInfoModal(
            "Error",
            response.message || "Failed to send OTP. Please try again.",
          );
          setLoading(false);
          return;
        }

        if (isResend) {
          showInfoModal("Success", "OTP has been resent to your email.");
          setTimer(60);
        }
      } catch (err: any) {
        showInfoModal("Error", err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    },
    [email, sendOtp],
  );

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
        email as string,
        userCode,
        "forgot-password",
      );

      logger.log("OTP verification response:", response);

      if (!response.success) {
        setIsOtpInvalid(true);
        showInfoModal("Error", "Invalid OTP. Please try again.");
        setLoading(false);
        return;
      }

      await SecureStore.setItemAsync(
        "forgot_password_verified_email",
        email as string,
      );

      const token = response.loginToken;

      if (token) {
        await SecureStore.setItemAsync("forgotPasswordInProgress", "true");
        await signInWithTemporaryToken(token);
      } else {
        showInfoModal("Error", "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      navService.push(ROUTES.AUTH.FORGOT_PASSWORD.STEP_3, { email });
    } catch (error) {
      logger.error("Error verifying OTP:", error);
      showInfoModal("Error", "Failed to verify OTP. Please try again.");
      setLoading(false);
    }
  };

  const handleResendPress = () => {
    if (timer > 0 || loading) return;
    handleSendOtp(true);
  };

  const handleNextPress = () => {
    const userCode = otp.join("");
    submitOtp(userCode);
  };

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

  useEffect(() => {
    handleSendOtp(false);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <View className="flex-1 p-6">
        <Text style={typography["h1-bold"]} className="text-black mt-4 mb-2">
          Enter one-time code
        </Text>

        <Text
          style={typography["subheader"]}
          className="mb-6 text-black leading-normal"
        >
          Enter the 5 digit code that was sent to your email address:{" "}
          <Text style={typography["subheader-bold"]} className="text-primary">
            {email as string}
          </Text>
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
          <Text style={typography["subheader"]} className="text-[#E65656] mb-6">
            Invalid OTP. Please try again.
          </Text>
        )}

        <ResendCode
          onResend={handleResendPress}
          timer={timer}
          loading={loading}
        />
      </View>

      <View className="px-6 pb-9">
        <PrimaryButton
          title={loading ? "Loading..." : "Next"}
          onPress={handleNextPress}
          disabled={!allFilled || loading}
          loading={loading}
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

export default ForgotPassword2;
