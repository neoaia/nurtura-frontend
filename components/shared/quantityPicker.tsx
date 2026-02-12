import { typography } from "@/assets/fonts/Text";
import { Text, TouchableOpacity, View } from "react-native";

interface QuantityPickerProps {
  title: string;
  quantity: number;
  onSubtractPress: () => void;
  onAddPress: () => void;
}

export const QuantityPicker = ({
  title,
  quantity,
  onSubtractPress,
  onAddPress,
}: QuantityPickerProps) => {
  return (
    <View
      className={
        "border-[2px] border-grayText flex justify-between items-center flex-row w-full px-2 rounded-full"
      }
    >
      <TouchableOpacity
        className="px-6 py-4 my-1 rounded-full bg-[#E5EDCF]"
        onPress={onSubtractPress}
      >
        <Text className="text-3xl">-</Text>
      </TouchableOpacity>

      <View className="flex-col items-center py-3">
        <Text style={typography["button-bold"]}>{quantity}</Text>
        <Text style={typography["subheader"]}>{title}</Text>
      </View>

      <TouchableOpacity
        className="px-6 py-4 my-1 rounded-full bg-[#E5EDCF]"
        onPress={onAddPress}
      >
        <Text className="text-3xl">+</Text>
      </TouchableOpacity>
    </View>
  );
};
