import { typography } from "@/assets/fonts/Text";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { InfoModal } from "@/components/modals/infoModal";
import { BottomButton } from "@/components/shared/bottomButton";
import Dropdown, { DropdownOption } from "@/components/shared/dropdown";
import { useBackWarning } from "@/hooks/shared/useBackWarning";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import RackIcon from "../../../../assets/images/icons/rack(gray).svg";

const AddNewPlant1 = () => {
  const [selectedRack, setSelectedRack] = useState<DropdownOption | null>(null);
  const [rackOptions, setRackOptions] = useState<DropdownOption[]>([]);
  const [loadingRacks, setLoadingRacks] = useState(false);
  const [showOccupiedModal, setShowOccupiedModal] = useState(false);

  const handleBack = useCallback(() => {
    router.replace("/(tabs)/(home)");
  }, []);

  const { showModal, handleConfirm, handleCancel } = useBackWarning(
    !!selectedRack,
    handleBack,
  );

  const { refetch: fetchRacks } = useFetch("/racks", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const loadRacks = async () => {
    setLoadingRacks(true);
    try {
      const response = await rackService.getAllUserRack(fetchRacks);
      if (response?.data) {
        const options = response.data
          .filter((rack: any) => rack.isActive)
          .map((rack: any) => ({
            id: rack.id,
            label: rack.name,
            value: rack.id,
            hasPlant: !!rack.currentPlant, // ← idagdag ang field na ito
          }));
        setRackOptions(options);
      }
    } catch (e) {
      console.error("Failed to load racks:", e);
    } finally {
      setLoadingRacks(false);
    }
  };

  useEffect(() => {
    loadRacks();
  }, []);

  useFocusEffect(
    useCallback(() => {
      handleCancel();
    }, []),
  );

  const handleSelectRack = useCallback((item: DropdownOption) => {
    if (item.hasPlant) {
      setShowOccupiedModal(true);
      return;
    }
    setSelectedRack(item);
  }, []);

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

        {loadingRacks ? (
          <ActivityIndicator color="#10b981" className="mt-4" />
        ) : (
          <Dropdown
            placeholder="Select your device here"
            options={rackOptions}
            value={selectedRack?.label}
            onSelect={handleSelectRack}
            label="Selected Rack"
            Icon={RackIcon}
          />
        )}
      </ScrollView>

      <BottomButton
        title="Next"
        onPress={handleNextPress}
        disabled={!selectedRack || loadingRacks}
      />

      <ConfirmationModal
        isVisible={showModal}
        onConfirm={handleConfirm}
        title="Go Back"
        message="All details you have entered will be restarted and gone."
        confirmText="Continue"
        cancelText="Cancel"
        onCancel={handleCancel}
      />

      <InfoModal
        isVisible={showOccupiedModal}
        title="Rack Unavailable"
        message="This rack already has a plant. Please select another rack or remove the current plant first."
        confirmText="Got it!"
        onConfirm={() => setShowOccupiedModal(false)}
      />
    </View>
  );
};

export default AddNewPlant1;
