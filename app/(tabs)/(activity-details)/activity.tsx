import { MenuCard } from "@/components/shared/menubtn";
import React from "react";
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();

  const menuItems = [
    {
      title: 'Plant Care Activity',
      desc: 'View your watering and grow light activity.',
      icon: require('@/assets/images/plantcare-icon.png'),
      path: '/(tabs)/(activity-details)/plant-care'
    },
    {
      title: 'Harvest Activity',
      desc: 'View history of your harvests.',
      icon: require('@/assets/images/harvest-icon.png'),
      path: '/(tabs)/(activity-details)/harvest'
    },
    {
      title: 'Planting Activity',
      desc: 'View logs based on your planting activity.',
      icon: require('@/assets/images/planting-icon.png'),
      path: '/(tabs)/(activity-details)/planting'
    }
  ];

  return (
    <View className="flex-1 bg-[#F8F9FA]" style={{ paddingTop: insets.top }}>
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => (
          <MenuCard
            title={item.title}
            description={item.desc}
            iconSource={item.icon}
            route={item.path as any}
          />
        )}
        ListHeaderComponent={() => (
          <Text className="text-[40px] font-bold mb-6">Activity</Text>
        )}
        contentContainerStyle={{ 
          padding: 16, 
          paddingBottom: insets.bottom + 16 
        }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}