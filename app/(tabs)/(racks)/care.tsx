import { NotificationItem } from "@/components/notifications/notificationItem";
import CareItem from "@/components/racks/careItem";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const care = () => {
  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4 bg-white">
          <CareItem
            type="water"
            plantName="Lettuce"
            value="200 mL"
            time="2h ago"
          />
          <CareItem type="light" plantName="Tomato" value="80%" time="5m ago" />

          <NotificationItem
            type="water"
            plantName="Lettuce"
            location="Lily Pod"
            value="200"
            time="2h ago"
          />
          <NotificationItem
            type="environment"
            rackName="Rack A"
            metric="temperature"
            value="35"
            time="5m ago"
          />
          <NotificationItem
            type="sensor"
            component="Water Pump"
            rackName="Rack B"
            time="1h ago"
          />
          <NotificationItem type="info" rackName="Rack C" time="30m ago" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default care;
