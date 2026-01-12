import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface SummaryCardProps {
  value: string | number;
  unit: string;
  label: string;
}

export const HarvestSummaryCard: React.FC<SummaryCardProps> = ({ value, unit, label }) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconBackground}>
          <Image 
            source={require("@/assets/images/harvest-icon.png")} 
            style={styles.icon} 
          />
        </View>
        
        <Text style={styles.valueText}>{value}</Text>
      </View>

      <View style={styles.bottomContent}>
        <Text style={styles.unitText}>{unit}</Text>
        <Text style={styles.labelText}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  iconBackground: {
    backgroundColor: "#E5EDCF",
    padding: 10,
    borderRadius: 12,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: "#7a904a",
    resizeMode: "contain",
  },
  valueText: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#333",
    marginTop: -3,
  },
  bottomContent: {
    gap: 4,
  },
  unitText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  labelText: {
    fontSize: 14,
    color: "#86975A",
    fontWeight: "500",
  },
});