import { typography } from "@/assets/fonts/Text";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface DropdownOption {
  id: string;
  label: string;
  value: string;
}

interface DropdownProps {
  placeholder?: string;
  value?: string;
  options: DropdownOption[];
  onSelect: (item: DropdownOption) => void;
  label?: string; // Added label prop
}

const Dropdown: React.FC<DropdownProps> = ({
  placeholder = "Select an option",
  value,
  options,
  onSelect,
  label = "Selected Rack", // Default label
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleOptionPress = (item: DropdownOption) => {
    onSelect(item);
    bottomSheetModalRef.current?.dismiss();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <>
      <View>
        <TouchableOpacity
          onPress={handlePresentModalPress}
          activeOpacity={0.7}
          className="bg-white rounded-2xl p-5 shadow-sm border-[2px] border-gray-100 w-full"
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-4 flex-1">
              <View className="w-14 h-14 bg-[#E5EDCF] rounded-xl items-center justify-center" />
              <View className="flex-1">
                {value && (
                  <Text
                    style={typography["subheader"]}
                    className="text-grayText mb-1"
                  >
                    {label}
                  </Text>
                )}
                <Text
                  style={
                    value ? typography["button-bold"] : typography["subheader"]
                  }
                  className={`${value ? "text-black" : "text-grayText"}`}
                  numberOfLines={1}
                >
                  {value || placeholder}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        enableDynamicSizing={true}
        maxDynamicContentSize={600}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        backgroundStyle={{ borderRadius: 24 }}
        handleComponent={null}
      >
        <BottomSheetView className="p-5 pb-10">
          <View className="mb-4 items-center pt-2">
            <Text style={typography["h2-bold"]}>Select Option</Text>
          </View>

          <View>
            {options.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleOptionPress(item)}
                className={`py-4 border-b border-gray-100 flex-row justify-between items-center ${
                  value === item.label ? "bg-[#E5EDCF] px-2 rounded-lg" : ""
                }`}
              >
                <Text
                  style={
                    value === item.label
                      ? typography["subheader-bold"]
                      : typography["subheader"]
                  }
                  className={
                    value === item.label ? "text-primary" : "text-black"
                  }
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

export default Dropdown;
