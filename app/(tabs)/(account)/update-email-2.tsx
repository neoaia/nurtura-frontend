import { typography } from "@/assets/fonts/Text";
import { InfoModal } from "@/components/modals/infoModal";
import { PrimaryButton } from "@/components/shared/primaryButton";
import useFetch from "@/hooks/useFetch";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { logger } from "@/utils/logger";
import { NavigationService, ROUTES } from "@/utils/navigationUtils";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OTPInput } from "../../../components/auth/otpInput";
import { ResendCode } from "../../../components/auth/resendCode";

export default function UpdateEmailScreen2() {
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const inputs = useRef<(TextInput | null)[]>([]);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalTitle, setInfoModalTitle] = useState("");
  const [infoModalMessage, setInfoModalMessage] = useState("");

  const showInfoModal = (title: string, message: string) => {
    setInfoModalTitle(title);
    setInfoModalMessage(message);
    setInfoModalVisible(true);
  };

  const navService = new NavigationService(router);

  const allFilled = otp.every((digit) => digit !== "");

  const { email } = useLocalSearchParams();

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

  const { refetch: updateUserInfo } = useFetch("/users", {
    method: "PATCH",
    autoFetch: false,
    withAuth: true,
  });

  const handleSendOtp = useCallback(
    async (isResend = false) => {
      if (!email) return;

      setIsLoading(true);
      try {
        const response = await authService.sendOtp(sendOtp, email as string);

        if (!response.success) {
          showInfoModal(
            "Error",
            response.message || "Failed to send OTP. Please try again.",
          );
          setIsLoading(false);
          return;
        }

        if (isResend) {
          showInfoModal("Success", "OTP has been resent to your email.");
          setTimer(60);
        }
      } catch (err: any) {
        showInfoModal("Error", err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, sendOtp],
  );

  const submitOtp = async (enteredOtp: string) => {
    if (!email) return;
    setIsLoading(true);

    try {
      const otpResponse = await authService.verifyOtp(
        verifyOtp,
        email as string,
        enteredOtp,
        "registration",
      );

      if (!otpResponse.success) {
        setIsOtpInvalid(true);
        showInfoModal(
          "Error",
          otpResponse.message || "OTP verification failed. Please try again.",
        );
        return;
      }

      logger.log("OTP verified, updating user email...");
      const updateResponse = await userService.updateUser(updateUserInfo, {
        email: email as string,
      });

      if (!updateResponse) {
        showInfoModal(
          "Error",
          "Failed to update email. Please try again or contact support.",
        );
        return;
      }

      logger.log("Email updated successfully");
      navService.reset(ROUTES.TABS.ACCOUNT.SUCCESS, {
        type: "other",
        title: "E-mail updated!",
        subtitle: "You can now proceed back to making your account safe.",
        finishTitle: "Finish",
      });
    } catch (error) {
      setIsOtpInvalid(true);
      showInfoModal("Error", "An unexpected error occurred. Please try again.");
      logger.error("Email update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  //#region Button Handlers
  const handleResendPress = () => {
    if (timer > 0 || isLoading) return;
    handleSendOtp(true);
  };

  const handleNextPress = () => {
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

  const handleFocus = () => {
    const firstEmpty = otp.findIndex((v) => v === "");
    if (firstEmpty !== -1) {
      inputs.current[firstEmpty]?.focus();
    }
  };

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
      const enteredOtp = newOtp.join("");
      submitOtp(enteredOtp);
    }
  };
  //#endregion

  //#region Effects
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
  //#endregion

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
        />

        {isOtpInvalid && (
          <Text
            style={typography["subheader"]}
            className="text-[#E65656] mb-[26px]"
          >
            Invalid OTP. Please try again.
          </Text>
        )}

        <ResendCode onResend={handleResendPress} timer={timer} />
      </ScrollView>

      <View className="px-6 pb-9">
        <PrimaryButton
          title="Next"
          onPress={handleNextPress}
          disabled={!allFilled || isLoading}
          loading={isLoading}
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
}
