import {
  HeaderBackButton,
  HeaderBackButtonProps,
} from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";

export const useBackWarning = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    setShowModal(false);
    router.back();
  };

  const handleCancel = () => setShowModal(false);

  // Android Hardware Back
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setShowModal(true);
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, []),
  );

  // Header Back Arrow
  useEffect(() => {
    navigation.setOptions({
      headerLeft: (props: HeaderBackButtonProps) => (
        <HeaderBackButton
          {...props}
          onPress={() => {
            setShowModal(true);
          }}
        />
      ),
    });
  }, [navigation]);

  return { showModal, setShowModal, handleConfirm, handleCancel };
};
