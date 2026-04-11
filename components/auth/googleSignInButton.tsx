import { typography } from "@/assets/fonts/Text";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { Image, Text } from "react-native";

interface GoogleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const GoogleSignInButton = ({
  onPress,
  disabled,
}: GoogleSignInButtonProps) => {
  return (
    <DebouncedTouchableOpacity
      className={`flex-row items-center justify-center p-6 rounded-[12px] w-[100%] bg-white shadow-sm-subtle ${
        disabled ? "opacity-50" : "opacity-100"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <Image
        source={require("@/assets/images/google.png")}
        className="w-5 h-5 mr-3"
        resizeMode="contain"
      />
      <Text style={typography["button-bold"]} className="  text-black">
        Continue with Google
      </Text>
    </DebouncedTouchableOpacity>
  );
};
