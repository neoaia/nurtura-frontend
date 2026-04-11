import { typography } from "@/assets/fonts/Text";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { Ionicons } from "@expo/vector-icons";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useRef } from "react";
import { Text, View } from "react-native";

export interface DropdownOption {
  id: string;
  label: string;
  value: string;
  hasPlant?: boolean;
}

interface DropdownProps {
  placeholder?: string;
  value?: string;
  options: DropdownOption[];
  onSelect: (item: DropdownOption) => void;
  label?: string;
  Icon?: React.FC<{ width?: number; height?: number }>;
}

const Dropdown: React.FC<DropdownProps> = ({
  placeholder = "Select an option",
  value,
  options,
  onSelect,
  label,
  Icon,
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
        <DebouncedTouchableOpacity
          onPress={handlePresentModalPress}
          activeOpacity={0.7}
          className="flex-row items-center justify-between border-[2px] border-grayText rounded-xl py-3 px-4 bg-white"
        >
          <View className="flex-row items-center">
            {Icon ? (
              <Icon width={17} height={17} />
            ) : (
              <Ionicons name="layers-outline" size={20} color="#666" />
            )}
            <Text
              style={typography["subheader"]}
              className="ml-3 text-black"
              numberOfLines={1}
            >
              {value || placeholder}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </DebouncedTouchableOpacity>
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
              <DebouncedTouchableOpacity
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
              </DebouncedTouchableOpacity>
            ))}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

export default Dropdown;
