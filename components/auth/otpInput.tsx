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
    index: number,
  ) => void;
  onFocus: (index: number) => void;
  inputRefs: React.MutableRefObject<(TextInput | null)[]>;
  isInvalid?: boolean;
  disabled?: boolean;
}

export const OTPInput = ({
  otp,
  onChangeOtp,
  onKeyPress,
  onFocus,
  inputRefs,
  isInvalid,
  disabled = false,
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
          onFocus={() => onFocus(index)}
          keyboardType="number-pad"
          maxLength={1}
          editable={!disabled}
          style={typography["h2-bold"]}
          className={`h-[60px] w-[60px] border-[2px] rounded-xl text-black text-center   ${
            isInvalid ? "border-[#E65656]" : "border-grayText"
          }`}
          returnKeyType="next"
        />
      ))}
    </View>
  );
};
