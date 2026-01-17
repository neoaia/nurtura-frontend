import { Tabs } from 'expo-router';
import '../globals.css';

const _layout = () => {

  return (
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
        options={{ title: 'Add New' }}
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
  )
}

export default _layout;
