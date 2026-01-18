import { typography } from "@/assets/fonts/Text";
import Dropdown from "@/components/shared/dropdown";
import React from "react";
import { Text, View } from "react-native";

const addNewPlant1 = () => {
  return (
    <View className="flex-1 bg-white px-[16px] pb-[34px] w-full justify-between h-screen">
      <View className="mt-[34px] flex-1 items-start">
        <Text
          style={typography["h1-bold"]}
          className="text-black mb-[13px] pl-2"
        >
          Select a{" "}
          <Text style={typography["h1-bold"]} className="text-primary">
            Nurtura Rack
          </Text>
        </Text>

        <Text
          style={typography["subheader"]}
          className="mb-[20px] text-gray-700 leading-normal pl-2"
        >
          Enter a secure password to protect your account.
        </Text>

        <Dropdown></Dropdown>
      </View>
    </View>
  );
};

export default addNewPlant1;
