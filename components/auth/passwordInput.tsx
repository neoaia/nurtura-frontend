import { typography } from "@/assets/fonts/Text";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { Image, Text, TextInput, View } from "react-native";

interface PasswordInputProps {
  value: string;
  onChangeText?: (text: string) => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  hasError?: boolean;
  label?: string;
  type?: "login" | "signup" | "change-password";
  borderColor?: string;
}

export const PasswordInput = ({
  value,
  onChangeText,
  isVisible,
  onToggleVisibility,
  hasError,
  label = "Password",
  type = "login",
}: PasswordInputProps) => {
  const getBorderColor = () => {
    if (value.length === 0) return "border-[#919191]";
    if (hasError) return "border-[#E65656]";

    if (type === "signup" || type === "change-password") {
      return "border-[#4CAF50]";
    }

    return "border-[#919191]";
  };

  return (
    <View className="relative w-full">
      <View
        className={`w-[100%] py-3 px-3 border-[2px] rounded-2xl bg-white mb-[6px] ${getBorderColor()}`}
      >
        <Text style={typography["subheader"]} className="text-primary pl-1">
          {label}
        </Text>
        <TextInput
          style={[
            typography["button"],
            { padding: 0, margin: 0, minHeight: 22 },
          ]}
          className="text-black pl-1 pr-10"
          secureTextEntry={!isVisible}
          keyboardType="default"
          autoCapitalize="none"
          value={value}
          onChangeText={onChangeText}
        />
      </View>

      <DebouncedTouchableOpacity
        onPress={onToggleVisibility}
        activeOpacity={1}
        className="absolute right-5 pr-2 top-1/2 -translate-y-1/2"
      >
        <Image
          source={
            isVisible
              ? require("@/assets/images/eyeopen.png")
              : require("@/assets/images/eyeclosed.png")
          }
          className="w-5 h-5"
          resizeMode="contain"
        />
      </DebouncedTouchableOpacity>
    </View>
  );
};
