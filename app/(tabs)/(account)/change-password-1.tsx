import { typography } from "@/assets/fonts/Text";
import React, { useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";

import { OTPInput } from "@/components/auth/otpInput";
import { ResendCode } from "@/components/auth/resendCode";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { useBackWarning } from "@/hooks/shared/useBackWarning";
import { router } from "expo-router";

export default function ChangePassword1() {
  const { showModal, handleConfirm, handleCancel } = useBackWarning();
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const inputs = useRef<(TextInput | null)[]>([]);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  const [timer, setTimer] = useState(0);

  const handleResendPress = () => {
    setTimer(60);
  };
  const handleNextPress = () => {
    router.push("/(tabs)/(account)/change-password-2");
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

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;
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
          <Text className="text-primary font-bold"></Text>
        </Text>
        <OTPInput
          otp={otp}
          onChangeOtp={handleChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          inputRefs={inputs}
          isInvalid={isOtpInvalid}
        />
        <ResendCode onResend={handleResendPress} timer={timer} />
      </ScrollView>
      <View className="px-4 pb-9">
        <PrimaryButton title="Next" onPress={handleNextPress}></PrimaryButton>
        <ConfirmationModal
          isVisible={showModal}
          onConfirm={handleConfirm}
          title="Go Back"
          message="All details you have entered will be restarted and gone."
          confirmText="Continue"
          cancelText="Cancel"
          onCancel={handleCancel}
        />
      </View>
    </View>
  );
}
