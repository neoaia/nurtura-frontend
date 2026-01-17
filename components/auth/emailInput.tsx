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
        className={`w-[100%] pt-2 px-3 border-[2px] rounded-xl bg-white mb-[6px] ${
          error
            ? "border-[#E65656]"
            : hasError
              ? "border-[#E65656]"
              : "border-grayText"
        }`}
      >
        <Text className="text-primary text-sm pt-[4px] pl-[4px]">
          Email
        </Text>
        <TextInput
          className="text-black text-base"
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
        <Text className="text-[#E65656] text-base mt-1 pl-2 mb-[10px]">
          {error}
        </Text>
      )}
    </>
  );
};
