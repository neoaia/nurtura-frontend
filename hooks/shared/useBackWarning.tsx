import {
  HeaderBackButton,
  HeaderBackButtonProps,
} from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";

export const useBackWarning = (isDirty: boolean = false) => {
  const router = useRouter();
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  // Android Hardware Back
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isDirty) {
          setShowModal(true);
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [isDirty]),
  );

  const handleConfirm = () => {
    setShowModal(false);
    router.back();
  };

  const handleCancel = () => setShowModal(false);

  // Header Back Arrow
  useEffect(() => {
    navigation.setOptions({
      headerLeft: (props: HeaderBackButtonProps) => (
        <HeaderBackButton
          {...props}
          onPress={() => {
            if (isDirty) {
              setShowModal(true);
            } else {
              router.back();
            }
          }}
        />
      ),
    });
  }, [navigation, isDirty]);

  return { showModal, setShowModal, handleConfirm, handleCancel };
};
