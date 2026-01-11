import React from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";

interface HarvestItemProps {
  plantName: string;
  rackName: string;
  time: string;
  weight: string;
  plantImage: ImageSourcePropType;
}

export const HarvestItem: React.FC<HarvestItemProps> = ({ 
  plantName, 
  rackName, 
  time, 
  weight, 
  plantImage 
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={plantImage} style={styles.plantImage} />
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.textGroup}>
          <Text style={styles.plantTitle}>{plantName}</Text>
          <Text style={styles.locationSubtext}>at {rackName}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.statItem}>
            <Image 
              source={require("@/assets/images/plant-time-icon.png")} 
              style={styles.statIcon} 
            />
            <Text style={styles.statText}>{time}</Text>
          </View>

          <View style={styles.statItem}>
            <Image 
              source={require("@/assets/images/harvest-icon.png")} 
              style={styles.statIcon} 
            />
            <Text style={styles.statText}>{weight}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginVertical: 8,
  },

  imageContainer: {
    width: 90,
    height: 90,
    backgroundColor: "#e9f2d9",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  plantImage: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },

  detailsContainer: {
    flex: 1,
    marginLeft: 24,
    gap: 24,
  },

  textGroup: {
    gap: 4,
  },

  plantTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#86975A", 
  },

  locationSubtext: {
    fontSize: 14,
    color: "#919191",
    fontWeight: "500",
  },

  infoRow: {
    flexDirection: "row",
    gap: 72,
    marginRight: 32,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statIcon: {
    width: 18,
    height: 18,
    tintColor: "#7a904a",
    resizeMode: "contain",
  },
  
  statText: {
    fontSize: 14,
    color: "#919191",
    fontWeight: "500",
  },
});