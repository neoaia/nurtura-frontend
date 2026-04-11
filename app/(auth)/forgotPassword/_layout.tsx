import { Stack } from 'expo-router';
import { Image } from 'react-native';
import '../../globals.css';

export default function ForgetPasswordLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#fafafa' },
        headerBlurEffect: 'light',
        headerBackTitle: 'Back',
        headerShadowVisible: false,
        headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen 
        name="forgotPassword1" 
        options={{ 
          headerTitle: () => (
            <Image source={require('@/assets/images/progress1.png')} />
          ), 
          headerShown: true, 
        }} 
      />
      <Stack.Screen 
        name="forgotPassword2" 
        options={{ 
          headerTitle: () => (
            <Image source={require('@/assets/images/progress2.png')} />
          ), 
          headerShown: true, 
        }} 
      />
      <Stack.Screen 
        name="forgotPassword3" 
        options={{ 
          headerTitle: () => (
            <Image source={require('@/assets/images/progress3.png')} />
          ), 
          headerShown: true, 
        }} 
      />
      
    </Stack>
  );
}