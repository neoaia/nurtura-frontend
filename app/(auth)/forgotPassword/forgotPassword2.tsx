/* eslint-disable react/no-unescaped-entities */
import { InfoModal } from "@/components/modals/infoModal";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
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
    <View className="flex-1 bg-white px-[16px] pb-[34px] w-screen justify-between h-screen">
      <View className="mt-[34px] flex-1 items-start">
        <Text className="text-black font-bold text-3xl pl-2 mb-[13px]">
          Enter one-time code
        </Text>

        <Text className="pl-2 mb-[20px] text-base text-gray-700 leading-normal">
          Enter the 5 digit code that was sent to your email address: {""}
          <Text className="text-primary font-bold">{email}</Text>
        </Text>

        <View className="flex-row justify-between w-[100%] self-center mb-[10px]">
          {otp.map((value, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputs.current[index] = ref;
              }}
              value={value}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => handleFocus(index)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!loading}
              className={`h-[60px] w-[60px] border-[2px] rounded-[12px] text-black text-center text-xl font-bold ${
                isOtpInvalid ? "border-[#E65656]" : "border-grayText"
              }`}
              returnKeyType="next"
            />
          ))}
        </View>

        {isOtpInvalid && (
          <Text className="text-[#E65656] text-base mb-[26px] pl-2">
            Invalid OTP. Please try again.
          </Text>
        )}

        <View className="self-start pl-2 mb-[26px] flex-row items-center">
          <Text className="text-base text-gray-700 leading-normal">
            Didn't receive the code?{" "}
          </Text>
          <DebouncedTouchableOpacity
            onPress={handleResendPress}
            disabled={timer > 0 || loading}
          >
            <Text
              className={`text-base font-semibold underline ${
                timer > 0 || loading ? "text-gray-400" : "text-primary"
              }`}
            >
              {loading && timer === 0 ? "Sending..." : "Resend code"}
            </Text>
          </DebouncedTouchableOpacity>

          {timer > 0 && (
            <Text className="ml-2 text-base text-gray-500">({timer}s)</Text>
          )}
        </View>
      </View>

      <View className="w-full">
        <DebouncedTouchableOpacity
          onPress={handleNextPress}
          className={`w-full p-6 rounded-[12px] mt-2 flex items-center ${
            allFilled && !loading ? "bg-primary" : "bg-[#919191]"
          }`}
          disabled={!allFilled || loading}
        >
          <Text className="text-white text-xl font-bold">
            {loading ? "Loading..." : "Next"}
          </Text>
        </DebouncedTouchableOpacity>
      </View>

      <InfoModal
        isVisible={infoModalVisible}
        title={infoModalTitle}
        message={infoModalMessage}
        onConfirm={() => setInfoModalVisible(false)}
      />
    </View>
  );
};

export default ForgotPassword2;
