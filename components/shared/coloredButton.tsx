import { typography } from "@/assets/fonts/Text";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface ColoredButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  title: string;
}

export const ColoredButton = ({
  onPress,
  loading,
  disabled,
  title,
}: ColoredButtonProps) => {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      className="w-full p-6 rounded-xl mt-2 flex items-center bg-primary border-[2px] border-white"
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
    </TouchableOpacity>
  );
};
