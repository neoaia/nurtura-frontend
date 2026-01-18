import { typography } from "@/assets/fonts/Text";
import { Text, TextInput, View } from "react-native";

interface EmailInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  hasError?: boolean;
}

export const EmailInput = ({
  value,
  onChangeText,
  error,
  hasError,
}: EmailInputProps) => {
  return (
    <>
      <View
        className={`w-[100%] py-3 px-3 border-[2px] rounded-2xl bg-white mb-[6px] ${
          error
            ? "border-[#E65656]"
            : hasError
              ? "border-[#E65656]"
              : "border-grayText"
        }`}
      >
        <Text style={typography["subheader"]} className="text-primary pl-1">
          Email
        </Text>
        <TextInput
          style={[
            typography["button"],
            { padding: 0, margin: 0, minHeight: 22 },
          ]}
          className="text-black pl-1"
          value={value}
          onChangeText={onChangeText}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          contextMenuHidden={true}
          selectTextOnFocus={false}
        />
      </View>
      {error && error.length > 0 && (
        <Text
          style={typography["subheader"]}
          className="text-[#E65656] mt-1 pl-2 mb-[10px]"
        >
          {error}
        </Text>
      )}
    </>
  );
};
