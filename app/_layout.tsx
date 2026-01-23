import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "./globals.css";
import { createLogger } from "@/utils/logger";

const logger = createLogger("RootLayout");

const GOOGLE_SIGNUP_FLAG_KEY = "fromGoogle";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isBypassCheckComplete, setIsBypassCheckComplete] = useState(false);

  const isReady = !loading && isBypassCheckComplete;

  useEffect(() => {
    const checkBypassFlag = async () => {
      try {
        const flag = await SecureStore.getItemAsync(GOOGLE_SIGNUP_FLAG_KEY);
        setIsSigningUp(flag === "true");
      } catch (e) {
        logger.error("Failed to read Google sign-up flag:", e);
      } finally {
        setIsBypassCheckComplete(true);
      }
    };

    if (!loading) {
      checkBypassFlag();
    }
  }, [loading]);

  useEffect(() => {
    if (!isReady) return;

    const runGuard = async () => {
      const inAuthGroup = segments[0] === "(auth)";
      const inSignupFlow = inAuthGroup && segments[1] === "signup";
      const inLoginScreen = inAuthGroup && segments[1] === "login";
      const flag = await SecureStore.getItemAsync(GOOGLE_SIGNUP_FLAG_KEY);
      const isSigningUpFlag = flag === "true";

      if (!user && !inAuthGroup) {
        router.replace("/(auth)/login");
      } else if (
        user &&
        inAuthGroup &&
        !inSignupFlow &&
        !inLoginScreen &&
        !isSigningUpFlag
      ) {
        router.replace("/(tabs)/(home)");
      }
    };

    runGuard();
  }, [user, isReady, router, segments]);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  //this is where the animation should load so that the dashboard wont pop up in the first mount of the app
  const inAuthGroupForRender = segments[0] === "(auth)";
  if (!user && !inAuthGroupForRender) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="(auth)">
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "BricolageGrotesque-Regular": require("../assets/fonts/BricolageGrotesque-Regular.ttf"),
    "BricolageGrotesque-Bold": require("../assets/fonts/BricolageGrotesque-Bold.ttf"),
    "BricolageGrotesque-ExtraBold": require("../assets/fonts/BricolageGrotesque-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      logger.log("Fonts loaded successfully");
    }
    if (!fontsLoaded) {
      logger.log("Fonts are still loading");
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
