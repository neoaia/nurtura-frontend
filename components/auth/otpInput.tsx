import { typography } from "@/assets/fonts/Text";
import React from "react";
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";

interface OTPInputProps {
  otp: string[];
  onChangeOtp: (text: string, index: number) => void;
  onKeyPress: (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => void;
  onFocus: () => void;
  inputRefs: React.MutableRefObject<(TextInput | null)[]>;
  isInvalid?: boolean;
}

export const OTPInput = ({
  otp,
  onChangeOtp,
  onKeyPress,
  onFocus,
  inputRefs,
  isInvalid,
}: OTPInputProps) => {
  return (
    <View className="flex-row justify-between w-[100%] self-center mb-[10px]">
      {otp.map((value, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) inputRefs.current[index] = ref;
          }}
          value={value}
          onChangeText={(text) => onChangeOtp(text, index)}
          onKeyPress={(e) => onKeyPress(e, index)}
          onFocus={onFocus}
          keyboardType="number-pad"
          maxLength={1}
          style={typography['h2-bold']}
          className={`h-[60px] w-[60px] border-[2px] rounded-xl text-black text-center   ${
            isInvalid ? "border-[#E65656]" : "border-grayText"
          }`}
          returnKeyType="next"
        />
      ))}
    </View>
  );
};
