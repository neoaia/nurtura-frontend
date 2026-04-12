import { Stack, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";

export default function AddPagesLayout() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });
  }, [navigation]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
