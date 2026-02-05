import { typography } from "@/assets/fonts/Text";
import { ResendCode } from "@/components/auth/resendCode";
import { PrimaryButton } from "@/components/shared/primaryButton";
import useFetch from "@/hooks/useFetch";
import { authService } from "@/services/authService";
import { createLogger } from "@/utils/logger";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import { OTPInput } from "../../../components/auth/otpInput";
import "../../globals.css";

const logger = createLogger("EmailOTP");

const EmailOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const inputs = useRef<(TextInput | null)[]>([]);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const allFilled = otp.every((digit) => digit !== "");

  const router = useRouter();
  const { email } = useLocalSearchParams();

  const { refetch: sendOtp } = useFetch("/api/auth/otp/registration", {
    method: "POST",
    autoFetch: false,
    withAuth: false,
  });

  const { refetch: verifyOtp } = useFetch("/api/auth/otp/verify", {
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
      } catch (err: any) {
        Alert.alert("Error", err.message || "An unexpected error occurred.");
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
      const enteredOtp = newOtp.join("");
      submitOtp(enteredOtp);
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

  const handleFocus = () => {
    const firstEmpty = otp.findIndex((v) => v === "");
    if (firstEmpty !== -1) {
      inputs.current[firstEmpty]?.focus();
    }
  };

  const submitOtp = async (enteredOtp: string) => {
    if (!email) return;
    setLoading(true);

    try {
      const response = await authService.verifyOtp(
        verifyOtp,
        email as string,
        enteredOtp,
        "registration",
      );

      if (!response.success) {
        setIsOtpInvalid(true);
        Alert.alert(
          "Error",
          response.message || "OTP verification failed. Please try again.",
        );
        return;
      }

      await SecureStore.setItemAsync("verified_email", email as string);
      router.push({
        pathname: "/(auth)/signup/createPassword",
        params: { email },
      });
    } catch (error) {
      setIsOtpInvalid(true);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      logger.log("OTP Verification Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPress = () => {
    const enteredOtp = otp.join("");
    submitOtp(enteredOtp);
  };

  const handleResendPress = () => {
    if (timer > 0 || loading) return;
    handleSendOtp(true);
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
        <Text
          className="text-black pl-2 mb-[13px]"
          style={typography["h1-bold"]}
        >
          Enter one-time code
        </Text>

        <Text
          style={typography["subheader"]}
          className="pl-2 mb-[20px] text-black leading-normal"
        >
          Enter the 5 digit code that was sent to your email address:{" "}
          <Text className="text-primary" style={typography["subheader-bold"]}>
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
            className="text-[#E65656] mb-[26px] pl-2"
          >
            Invalid OTP. Please try again.
          </Text>
        )}

        <ResendCode onResend={handleResendPress} timer={timer} />
      </View>

      <View className="w-full">
        <PrimaryButton
          onPress={handleNextPress}
          loading={loading}
          disabled={!allFilled}
          title="Next"
        />
      </View>
    </View>
  );
};

export default EmailOTP;
