import React, { useCallback, useState } from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

export interface DebouncedTouchableProps extends Omit<
  TouchableOpacityProps,
  "onPress"
> {
  onPress?: (() => void | Promise<void>) | undefined;
  delayMs?: number;
}

export const DebouncedTouchableOpacity: React.FC<DebouncedTouchableProps> = ({
  onPress,
  delayMs = 500,
  disabled,
  children,
  ...props
}) => {
  const [isDebouncing, setIsDebouncing] = useState(false);

  const handlePress = useCallback(async () => {
    if (disabled || isDebouncing || !onPress) return;

    setIsDebouncing(true);
    try {
      await onPress();
    } finally {
      setTimeout(() => setIsDebouncing(false), delayMs);
    }
  }, [disabled, isDebouncing, onPress, delayMs]);

  return (
    <TouchableOpacity
      {...props}
      onPress={handlePress}
      disabled={disabled || isDebouncing}
    >
      {children}
    </TouchableOpacity>
  );
};
