import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { Text, View } from "react-native";

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: React.ReactNode;
}

export const Checkbox = ({ checked, onPress, label }: CheckboxProps) => {
  const CHECKBOX_BG = checked ? "bg-primary" : "border-gray-300 border-[2px]";

  return (
    <View className="flex-row items-center justify-start pr-4">
      <DebouncedTouchableOpacity onPress={onPress}>
        <View
          className={`ml-1 mr-4 w-6 h-6 rounded-md flex items-center justify-center ${CHECKBOX_BG}`}
        >
          {checked && <Text className="text-sm font-bold text-white">✓</Text>}
        </View>
      </DebouncedTouchableOpacity>

      {label && <View className="flex-1 flex-row flex-wrap ml-1">{label}</View>}
    </View>
  );
};
