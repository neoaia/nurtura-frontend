import { typography } from "@/assets/fonts/Text";
import React from "react";
import { Text, View } from "react-native";

interface SmallDescriptionProps {
  label: string;
  value: string;
  Icon?: React.FC<{ width?: number; height?: number }>;
}

const smallDescription: React.FC<SmallDescriptionProps> = ({
  label,
  value,
  Icon,
}) => {
  return (
    <View className="flex-row items-center justify-start gap-5">
      <View className="w-14 h-14 bg-[#E5EDCF] rounded-xl items-center justify-center">
        {Icon && <Icon width={20} height={20} />}
      </View>
      <View>
        <Text style={typography["subheader"]} className=" text-grayText mb-1">
          {label}
        </Text>
        <Text style={typography["button-bold"]} className=" text-black  ">
          {value}
        </Text>
      </View>
    </View>
  );
};

export default smallDescription;
