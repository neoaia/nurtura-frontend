import { typography } from "@/assets/fonts/Text";
import { Text, View } from "react-native";

interface DividerProps {
  text?: string;
}

export const Divider = ({ text = "or" }: DividerProps) => {
  return (
    <View className="flex-row items-center my-6 mb-[25px] w-full">
      <View className="flex-1 h-px bg-[#B7B7B7] mx-4" />
      <Text style={typography["label"]} className="text-black">
        {text}
      </Text>
      <View className="flex-1 h-px bg-[#B7B7B7] mx-4" />
    </View>
  );
};
