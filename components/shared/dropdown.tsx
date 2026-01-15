import React from "react";
import { Text, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";

interface DropdownProps {
  placeholder?: string;
  value?: string;
  onPress?: () => void;
}

// Chevron Down Icon
const ChevronDownIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9l6 6 6-6"
      stroke="#9CA3AF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Dropdown: React.FC<DropdownProps> = ({
  placeholder = "Select an option",
  value,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-full border-2 border-gray-300 rounded-2xl px-5 py-4 flex-row items-center justify-between bg-white"
      activeOpacity={0.7}
    >
      <Text
        className={`text-base flex-1 mr-2 ${value ? "text-gray-900 font-medium" : "text-gray-400"}`}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      <ChevronDownIcon />
    </TouchableOpacity>
  );
};

export default Dropdown;
