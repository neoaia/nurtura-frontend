import { ActivityItem } from '@/components/activity/activityItem';
import { HarvestSummaryCard } from '@/components/activity/harvestCard';
import { HarvestItem } from '@/components/activity/harvestItem';
import { PlantItem } from '@/components/activity/plantingItem';
import { ActivityButton } from '@/components/activity/sensorToggle';

import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivityScreen() {
  const [activeTab, setActiveTab] = useState<"water" | "light">("water");
    return (
        <SafeAreaView>
          <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <View style={styles.buttonRow}>
                    <ActivityButton 
                        status={activeTab === "water" ? "clickedWater" : "defaultWater"} 
                        onPress={() => setActiveTab("water")}
                    />
                    <ActivityButton 
                        status={activeTab === "light" ? "clickedLight" : "defaultLight"} 
                        onPress={() => setActiveTab("light")}
                    />
                </View>

                <HarvestSummaryCard 
                    value="4.5" 
                    unit="Kilograms" 
                    label="Total harvest" 
                />

                <ActivityItem 
                    type='light'
                    plantName='Cherry Tomato'
                    rackName='Greens Rack'
                    location='Lily Pod Garden'
                    time='9:00 AM'
                    duration='2 mins'
                />

                <ActivityItem 
                    type='water'
                    plantName='Cherry Tomato'
                    rackName='Greens Rack'
                    location='Lily Pod Garden'
                    time='9:00 AM'
                    duration='2 mins'
                />

                <HarvestItem 
                    plantName="Radish"
                    rackName="Greens Rack"
                    time="9:18 AM"
                    weight="750 g"
                    plantImage={require("@/assets/images/plant-sample.png")}
                />

                <PlantItem 
                    plantName="Lettuce"
                    rackName="Greens Rack"
                    time="9:18 AM"
                    weight="3"
                    plantImage={require("@/assets/images/plant-sample.png")}
                />

            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#F8F9FA',
  },
  scrollContent: {
      padding: 16,
      gap: 12,
  },
  buttonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
  }
});
