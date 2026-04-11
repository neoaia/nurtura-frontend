import { typography } from "@/assets/fonts/Text";
import { OTPInput } from "@/components/auth/otpInput";
import { ResendCode } from "@/components/auth/resendCode";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { InfoModal } from "@/components/modals/infoModal";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { auth } from "@/firebase";
import { useBackWarning } from "@/hooks/shared/useBackWarning";
import useFetch from "@/hooks/useFetch";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { createLogger } from "@/utils/logger";
import { NavigationService, ROUTES } from "@/utils/navigationUtils";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const logger = createLogger("ChangePassword1");

export default function ChangePassword1() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  const [timer, setTimer] = useState(60);
  const [userEmail, setUserEmail] = useState<string>("");
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalTitle, setInfoModalTitle] = useState("");
  const [infoModalMessage, setInfoModalMessage] = useState("");

  const hasStartedOtp = otp.some((digit) => digit !== "");
  const { showModal, handleConfirm, handleCancel } =
    useBackWarning(!hasStartedOtp);

  const inputs = useRef<(TextInput | null)[]>([]);

  const allFilled = otp.every((digit) => digit !== "");
  const router = useRouter();
  const navService = new NavigationService(router);

  const showInfoModal = (title: string, message: string) => {
    setInfoModalTitle(title);
    setInfoModalMessage(message);
    setInfoModalVisible(true);
  };

  const { refetch: fetchUserDetails } = useFetch("/users", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: sendOtp } = useFetch("/auth/otp/password-reset", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: verifyOtp } = useFetch("/auth/otp/verify", {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const firebaseEmail = auth.currentUser?.email;
        if (firebaseEmail) {
          setUserEmail(firebaseEmail);
          logger.log("User email loaded from Firebase:", firebaseEmail);
          return;
        }

        const response = await userService.getUser(fetchUserDetails);

        const email = response?.userInfo?.email;
        if (email) {
          setUserEmail(email);
          logger.log("User email loaded from backend:", email);
          return;
        }

        const storedEmail = await SecureStore.getItemAsync("user_email");
        if (storedEmail) {
          setUserEmail(storedEmail);
          logger.log("User email loaded from SecureStore:", storedEmail);
          return;
        }

        showInfoModal(
          "Error",
          "Unable to retrieve current account email. Please sign in again.",
        );
        navService.goBack();
      } catch (error) {
        logger.error("Error loading user email", error);
        showInfoModal("Error", "Failed to load user information.");
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

        logger.log("OTP sent successfully");
      } catch (err: any) {
        logger.error("Error sending OTP", err);
        showInfoModal("Error", err.message || "An unexpected error occurred.");
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
        "password-reset",
      );

      if (!response.success) {
        setIsOtpInvalid(true);
        setOtp(["", "", "", "", ""]);
        inputs.current[0]?.focus();
        showInfoModal("Error", "Invalid OTP. Please try again.");
        setLoading(false);
        return;
      }

      logger.log("OTP verified successfully");

      await SecureStore.setItemAsync(
        "change_password_verified_email",
        userEmail,
      );

      navService.push(ROUTES.TABS.ACCOUNT.CHANGE_PASSWORD_2);
    } catch (error) {
      logger.error("Error verifying OTP:", error);
      showInfoModal("Error", "Failed to verify OTP. Please try again.");
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
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <Text style={typography["h1-bold"]} className="text-black mt-4 mb-2">
          Enter one-time code
        </Text>
        <Text
          style={typography["subheader"]}
          className="mb-6 text-black leading-normal"
        >
          Enter the 5 digit code that was sent to your email address:{" "}
          <Text style={typography["subheader-bold"]} className="text-primary">
            {userEmail}
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
          <Text className="text-[#E65656] text-base mb-6">
            Invalid OTP. Please try again.
          </Text>
        )}
        <ResendCode
          onResend={handleResendPress}
          timer={timer}
          loading={loading}
        />
      </ScrollView>

      <View className="px-6 pb-9">
        <PrimaryButton
          title={loading ? "Verifying..." : "Next"}
          onPress={handleNextPress}
          disabled={!allFilled || loading}
        />
      </View>

      <ConfirmationModal
        isVisible={showModal}
        title="Go Back?"
        message="Your progress will be lost if you go back."
        confirmText="Continue"
        onConfirm={handleConfirm}
        cancelText="Cancel"
        onCancel={handleCancel}
      />
      <InfoModal
        isVisible={infoModalVisible}
        title={infoModalTitle}
        message={infoModalMessage}
        onConfirm={() => setInfoModalVisible(false)}
      />
    </SafeAreaView>
  );
}
