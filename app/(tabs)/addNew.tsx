import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { typography } from "../../assets/fonts/Text";

interface AddNewModalProps {
  onClose: () => void;
}

export default function AddNewModal({ onClose }: AddNewModalProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
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
    []
  );

  const handlePlantPress = () => {
    bottomSheetRef.current?.close();
    onClose();
    // router.push('/add-plant');
  };

  const handleRackPress = () => {
    bottomSheetRef.current?.close();
    onClose();
    // router.push('/add-rack');
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={["30%"]}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: "#FAFAFA",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#FAFAFA",
        width: 40,
        height: 4,
      }}
    >
      <BottomSheetView className="flex-1 px-6 pt-4 pb-8 items-center">
        <Text style={typography['h2-bold']} className="  text-[#86975A] mb-8 text-center">
          Add to your Nurtura Farm
        </Text>

        <View className="flex-row gap-6 justify-center w-full">
          <TouchableOpacity
            className="items-center"
            onPress={handlePlantPress}
            activeOpacity={0.7}
          >
            <View className="w-20 h-20 bg-[#E5EDCF] rounded-2xl justify-center items-center mb-3">
              <Text className="text-4xl"></Text>
            </View>
            <Text style={typography['subheader']} className="  text-[#86975A]">Plant</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            onPress={handleRackPress}
            activeOpacity={0.7}
          >
            <View className="w-20 h-20 bg-[#E5EDCF] rounded-2xl justify-center items-center mb-3">
              <Text className="text-4xl"></Text>
            </View>
            <Text style={typography['subheader']} className=" *: text-[#86975A]">Rack</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
