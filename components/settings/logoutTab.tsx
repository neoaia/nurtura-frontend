import React from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LogOutTabProps {
  iconSource: ImageSourcePropType;
  label: string;
  onPress?: () => void;
}

export const LogOutRow: React.FC<LogOutTabProps> = ({
  iconSource,
  label,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.leftSection}>
        <Image source={iconSource} style={styles.icon} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: "#fff",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: "#EEE",
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 32,
    },
    label: {
      fontSize: 14,
      color: "#D34545",
      fontWeight: "400",
    },
    icon: {
      width: 22,
      height: 22,
      resizeMode: "contain",
    },
  });
  