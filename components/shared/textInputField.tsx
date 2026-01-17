import { Text, TextInput, View } from "react-native";

interface TextInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  width?: string;
}

export const TextInputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  width = "w-[100%]",
}: TextInputFieldProps) => {
  return (
    <View
      className={`${width} pt-2 px-3 border-[2px] rounded-xl bg-white mb-[10px] border-grayText`}
    >
      <Text className="text-primary text-sm pt-1 pl-1">
        {label}
      </Text>
      <TextInput
        className="text-black text-base"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
    </View>
  );
};
