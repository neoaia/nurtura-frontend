import { typography } from "@/assets/fonts/Text";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { ActivityIndicator, Text } from "react-native";

interface RemoveConnectionButtonProps {
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  title: string;
}

export const RemoveConnectionButton = ({
  onPress,
  loading,
  disabled,
  title,
}: RemoveConnectionButtonProps) => {
  const isDisabled = loading || disabled;

  return (
    <DebouncedTouchableOpacity
      className={`w-full p-6 rounded-xl mt-2 flex items-center ${
        isDisabled ? "bg-[#919191]" : "bg-[#DF4545]"
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
