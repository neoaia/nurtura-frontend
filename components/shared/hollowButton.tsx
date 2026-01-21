import { typography } from "@/assets/fonts/Text";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface HollowButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  title: string;
}

export const HollowButton = ({
  onPress,
  loading,
  disabled,
  title,
}: HollowButtonProps) => {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      className="w-full p-6 rounded-xl mt-2 flex items-center bg-white border-[2px] border-primary"
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={typography["button-bold"]} className="text-primary">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
