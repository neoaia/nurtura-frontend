import { typography } from "@/assets/fonts/Text";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { BottomButton } from "@/components/shared/bottomButton";
import Dropdown, { DropdownOption } from "@/components/shared/dropdown";
import { useBackWarning } from "@/hooks/shared/useBackWarning";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import RackIcon from "../../../../assets/images/icons/rack(Add).svg";

// mock data beybeh
const RACK_OPTIONS = [
  { id: "1", label: "Lettuce Rack", value: "lettuce" },
  { id: "2", label: "Tomato Setup", value: "tomato" },
  { id: "3", label: "Basil / Herbs", value: "basil" },
];

const AddNewPlant1 = () => {
  const [selectedRack, setSelectedRack] = useState<DropdownOption | null>(null);
  const { showModal, handleConfirm, handleCancel } = useBackWarning();

  useFocusEffect(
    useCallback(() => {
      handleCancel();
    }, []),
  );

  const handleNextPress = () => {
    if (!selectedRack) return;

    router.push({
      pathname: "/(tabs)/(add_pages)/(addNewPlant)/step-2",
      params: {
        rackId: selectedRack.id,
        rackName: selectedRack.label,
        rackValue: selectedRack.value,
      },
    });
  };

  const handleBackConfirm = () => {
    router.replace("/(tabs)/(home)");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 34 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mb-3 pl-2">
          Select a{" "}
          <Text style={typography["h1-bold"]} className="text-primary">
            Nurtura Rack
          </Text>
        </Text>

        <Text
          style={typography["subheader"]}
          className="mb-5 text-gray-700 leading-normal pl-2"
        >
          Choose which rack you want to add your plant to.
        </Text>

        <Dropdown
          placeholder="Select your device here"
          options={RACK_OPTIONS}
          value={selectedRack?.label}
          onSelect={(item) => setSelectedRack(item)}
          label="Selected Rack"
          Icon={RackIcon}
        />
      </ScrollView>

      <BottomButton
        title="Next"
        onPress={handleNextPress}
        disabled={!selectedRack}
      />
      <ConfirmationModal
        isVisible={showModal}
        onConfirm={handleBackConfirm}
        title="Go Back"
        message="All details you have entered will be restarted and gone."
        confirmText="Continue"
        cancelText="Cancel"
        onCancel={handleCancel}
      />
    </View>
  );
};

export default AddNewPlant1;
