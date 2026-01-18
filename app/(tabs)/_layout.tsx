import { Tabs } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../globals.css';
import AddNewModal from './addNew';

const Layout = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="(home)"
          options={{ title: 'Home' }}
        />
        <Tabs.Screen
          name="(racks)"
          options={{ title: 'Racks' }}
        />
        <Tabs.Screen
          name="addNew"
          options={{ 
            title: 'Add New',
            tabBarButton: () => (
              <Pressable 
                onPress={() => {
                  console.log('Add New pressed');
                  setModalVisible(true);
                }}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
              >
                <View className="w-12 h-12 bg-[#E5EDCF] rounded-xl items-center justify-center">
                  <Text className="text-2xl text-[#86975A]">+</Text>
                </View>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="(activity)"
          options={{ title: 'Activity' }}
        />
        <Tabs.Screen
          name="(account)"
          options={{ title: 'Account' }}
        />
      </Tabs>

      {modalVisible && (
        <AddNewModal onClose={() => setModalVisible(false)} />
      )}
    </GestureHandlerRootView>
  );
}

export default Layout;