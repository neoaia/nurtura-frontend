import { typography } from "@/assets/fonts/Text";
import { Text, TextInput, View } from "react-native";

interface NumberInputFieldProps {
  label: string;
  value: number;
  onChangeText: (text: string) => void;
  placeholder?: string;
  width?: string;
}

export const NumberInputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  width = "w-[100%]",
}: NumberInputFieldProps) => {
  const handleTextChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    onChangeText(numericValue);
  };

  return (
    <View
      className={`${width} py-3 px-3 border-[2px] rounded-2xl bg-white mb-[10px] border-grayText`}
    >
      <Text style={typography["subheader"]} className="text-primary pl-1 mb-1">
        {label}
      </Text>
      <TextInput
        style={[typography["button"], { padding: 0, margin: 0, minHeight: 22 }]}
        className="text-black pl-1"
        value={value === 0 && !placeholder ? "" : value.toString()}
        onChangeText={handleTextChange}
        // KEY UPDATES BELOW:
        keyboardType="numeric"
        returnKeyType="done"
      />
    </View>
  );
};
