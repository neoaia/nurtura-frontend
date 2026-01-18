import { typography } from "@/assets/fonts/Text";
import React from "react";
import { Text, View } from "react-native";

interface SmallDescriptionProps {
  label: string;
  value: string;
}

const smallDescription = ({ label, value }: SmallDescriptionProps) => {
  return (
    <View className="flex-row items-center justify-start gap-5">
      <View className="w-14 h-14 bg-[#E5EDCF] rounded-xl items-center justify-center"></View>
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
