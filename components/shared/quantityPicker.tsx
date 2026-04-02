import { typography } from "@/assets/fonts/Text";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Line } from "react-native-svg";

interface QuantityPickerProps {
  title: string;
  quantity: number;
  onSubtractPress?: () => void;
  onAddPress?: () => void;
}

const MinusIcon = () => (
  <Svg width={15} height={15} viewBox="0 0 18 18">
    <Line
      x1="3"
      y1="9"
      x2="15"
      y2="9"
      stroke="#3D3D3D"
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  </Svg>
);

const PlusIcon = () => (
  <Svg width={15} height={15} viewBox="0 0 18 18">
    <Line
      x1="9"
      y1="3"
      x2="9"
      y2="15"
      stroke="#3D3D3D"
      strokeWidth={2.5}
      strokeLinecap="round"
    />
    <Line
      x1="3"
      y1="9"
      x2="15"
      y2="9"
      stroke="#3D3D3D"
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  </Svg>
);

export const QuantityPicker = ({
  title,
  quantity,
  onSubtractPress,
  onAddPress,
}: QuantityPickerProps) => {
  return (
    <View className="border-[2px] border-grayText flex justify-between items-center flex-row w-full px-2 rounded-full">
      <TouchableOpacity
        className="p-6 my-1 rounded-full bg-[#E5EDCF] items-center justify-center"
        onPress={onSubtractPress}
      >
        <MinusIcon />
      </TouchableOpacity>

      <View className="flex-col items-center py-3">
        <Text style={typography["button-bold"]}>{quantity}</Text>
        <Text style={typography["subheader"]}>{title}</Text>
      </View>

      <TouchableOpacity
        className="p-6 my-1 rounded-full bg-[#E5EDCF] items-center justify-center"
        onPress={onAddPress}
      >
        <PlusIcon />
      </TouchableOpacity>
    </View>
  );
};
