import { typography } from "@/assets/fonts/Text";
import { Text, TouchableOpacity, View } from "react-native";

interface ResendCodeProps {
  onResend: () => void;
  timer: number;
}

export const ResendCode = ({ onResend, timer }: ResendCodeProps) => {
  return (
    <View className="self-start pl-2 mb-[26px] flex-row items-center">
      <Text
        style={typography["subheader"]}
        className="  text-grayText leading-normal"
      >
        Didn&apos;t receive the code?{" "}
      </Text>
      <TouchableOpacity onPress={onResend} disabled={timer > 0}>
        <Text
          style={typography["subheader-bold"]}
          className={` underline ${
            timer > 0 ? "text-grayText" : "text-primary"
          }`}
        >
          Resend code
        </Text>
      </TouchableOpacity>

      {timer > 0 && (
        <Text style={typography["subheader"]} className="ml-2   text-grayText">
          ({timer}s)
        </Text>
      )}
    </View>
  );
};
