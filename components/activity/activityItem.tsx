import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface ActivityItemProps {
  type: "water" | "light";
  plantName: string;
  rackName: string;
  location: string;
  time: string;
  duration: string;
}

const activityCategory = {
  water: {
    icon: require("@/assets/images/watered-icon.png"),
    time: require("@/assets/images/watered-time-icon.png"),
    plantcolor: "#2596be",
    actionText: "Watered the",
  },
  light: {
    icon: require("@/assets/images/light-icon.png"),
    time: require("@/assets/images/light-time-icon.png"),
    plantcolor: "#d6c125",
    actionText: "Provided light to",
  },
};

export const ActivityItem: React.FC<ActivityItemProps> = ({ type, plantName, rackName, location, time, duration }) => {
  const config = activityCategory[type];

  return (
    <View style={styles.activityCard}>
      <View style={styles.activityRow}>
        <View style={styles.activityDetails}>

        <View>
            <Text style={styles.activityText}>
                {config.actionText} 
                <Text style={{ color: config.plantcolor, fontWeight: 'bold' }}> {plantName}</Text>
            </Text>
            
            <Text style={styles.activitySubText}>
                {rackName} at {location}
            </Text>
        </View>

        <View style={styles.activitySubRow}>
            <View style={styles.activitySubRowDetails}>
                <Image source={config.time} style={styles.subIcon} />
                <Text style={styles.activityTime}>{time}</Text>
            </View>

            <View style={styles.activitySubRowDetails}>
                <Image source={config.icon} style={styles.subIcon} />
                <Text style={styles.activityTime}>{duration}</Text>
            </View>
        </View>

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    activityCard: {
      backgroundColor: "#fff",
      borderRadius: 14,
      padding: 14,
      marginBottom: 8,
      elevation: 2,
    },
  
    activityRow: {
      flexDirection: "row",
      alignItems: "center",
    },
  
    activityDetails: {
      margin: 10,
      flex: 1,
      gap: 25,
    },
  
    activityText: {
      fontSize: 14,
      fontWeight: "500",
      color: "#333",
    },

    activitySubText: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 4,
        color: "#919191",
      },
  
    activitySubRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      gap: 86,
    },

    activitySubRowDetails: {
        flexDirection: "row",
        gap: 6,
    },
  
    activityTime: {
      color: "#919191",
      fontSize: 12,
      marginLeft: 4,
    },

    subIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
      },
  });