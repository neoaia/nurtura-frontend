import { typography } from "@/assets/fonts/Text";
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
      className={`${width} py-4 px-3 border-[2px] rounded-2xl bg-white mb-[10px] border-grayText`}
    >
      <Text style={typography['subheader']} className="text-primary pl-1 mb-1">{label}</Text>
      <TextInput
        style={[typography["button"], { padding: 0, margin: 0 }]}
        className="text-black pl-1"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
    </View>
  );
};