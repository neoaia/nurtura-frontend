import { typography } from "@/assets/fonts/Text";
import { ActivityIndicator, Text } from "react-native";
import { DebouncedTouchableOpacity } from "./debouncedTouchable";

interface PrimaryButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  title: string;
}

export const PrimaryButton = ({
  onPress,
  loading,
  disabled,
  title,
}: PrimaryButtonProps) => {
  const isDisabled = loading || disabled;

  return (
    <DebouncedTouchableOpacity
      className={`w-full p-6 rounded-xl mt-2 flex items-center ${
        isDisabled ? "bg-[#919191]" : "bg-primary"
      }`}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={typography["button-bold"]} className="text-white">
          {title}
        </Text>
      )}
    </DebouncedTouchableOpacity>
  );
};
