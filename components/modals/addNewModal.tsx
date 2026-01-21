import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { typography } from "../../assets/fonts/Text";

interface AddNewModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface OptionButtonProps {
  icon: any;
  label: string;
  onPress: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  icon,
  label,
  onPress,
}) => (
  <TouchableOpacity
    className="items-center"
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View className="w-20 h-20 bg-[#E5EDCF] rounded-2xl justify-center items-center mb-3">
      <Image source={icon} className="w-10 h-10" resizeMode="contain" />
    </View>
    <Text style={typography["subheader"]} className="text-[#86975A]">
      {label}
    </Text>
  </TouchableOpacity>
);

export const AddNewModal: React.FC<AddNewModalProps> = ({
  isVisible,
  onClose,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["30%"], []);

  useEffect(() => {
    console.log("Modal isVisible:", isVisible);
    if (isVisible) {
      console.log("Attempting to open...");
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      console.log("Attempting to close...");
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log("Sheet index changed to:", index);
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleNavigation = useCallback(
    (route: string) => {
      bottomSheetRef.current?.close();
      onClose();
      setTimeout(() => {
        router.push(route as any);
      }, 100);
    },
    [onClose],
  );

  const handlePlantPress = () =>
    handleNavigation("/(add_pages)/(addNewPlant)/addNewPlant1");
  const handleRackPress = () =>
    handleNavigation("/(add_pages)/(addNewRack)/addNewRack1");

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: "#FAFAFA",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#D1D5DB",
        width: 40,
        height: 4,
      }}
    >
      <BottomSheetView className="flex-1 px-6 pt-4 pb-8 items-center">
        <Text
          style={typography["h2-bold"]}
          className="text-[#86975A] mb-8 text-center"
        >
          Add to your Nurtura Farm
        </Text>

        <View className="flex-row gap-6 justify-center w-full">
          <OptionButton
            icon={require("@/assets/images/plantIcon.png")}
            label="Plant"
            onPress={handlePlantPress}
          />
          <OptionButton
            icon={require("@/assets/images/rackIcon.png")}
            label="Rack"
            onPress={handleRackPress}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};
