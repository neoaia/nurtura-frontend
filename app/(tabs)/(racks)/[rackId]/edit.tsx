import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { MenuCard } from "@/components/shared/menubtn";
import { router, useLocalSearchParams } from "expo-router";

const EditRack = () => {
  const { rackId } = useLocalSearchParams<{ rackId: string }>();

  const [removePlantModal, setRemovePlantModal] = useState(false);
  const [removeRackModal, setRemoveRackModal] = useState(false);

  const handleRemovePlantPress = useCallback(
    () => setRemovePlantModal(true),
    [],
  );
  const handleRemoveRackPress = useCallback(() => setRemoveRackModal(true), []);

  const handleRemovePlantConfirm = useCallback(() => {
    setRemovePlantModal(false);
  }, []);

  const handleRemoveRackConfirm = useCallback(() => {
    setRemoveRackModal(false);
  }, []);

  const handleEditNamePress = useCallback(() => {
    router.push({
      pathname: `/(tabs)/(racks)/${rackId}/edit-rack-name` as any,
      params: { rackId },
    });
  }, [rackId]);

  const menuItems = useMemo(
    () => [
      {
        title: "Edit Name",
        desc: "Edit how you want to call your Nurtura Rack.",
        icon: require("@/assets/images/plantcare-icon.png"),
        onPress: handleEditNamePress,
      },
      {
        title: "Remove Plant",
        desc: "Remove the plant on your Nurtura Rack.",
        icon: require("@/assets/images/harvest-icon.png"),
        type: "red" as const,
        onPress: handleRemovePlantPress,
      },
      {
        title: "Remove Nurtura Rack",
        desc: "Remove this rack from your account.",
        icon: require("@/assets/images/planting-icon.png"),
        type: "red" as const,
        onPress: handleRemoveRackPress,
      },
    ],
    [handleEditNamePress, handleRemovePlantPress, handleRemoveRackPress],
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="bg-white">
      <View className="flex justify-center items-center px-4 bg-white">
        {menuItems.map((item, index) => (
          <View key={`menu-item-${index}`} className="w-full mb-3">
            <MenuCard
              title={item.title}
              description={item.desc}
              iconSource={item.icon}
              type={item.type}
              onPress={item.onPress}
            />
          </View>
        ))}
      </View>

      <ConfirmationModal
        isVisible={removePlantModal}
        title="Remove Plant?"
        message="This action cannot be undone."
        onCancel={() => setRemovePlantModal(false)}
        onConfirm={handleRemovePlantConfirm}
      />

      <ConfirmationModal
        isVisible={removeRackModal}
        title="Remove Nurtura Rack?"
        message="This action cannot be undone."
        onCancel={() => setRemoveRackModal(false)}
        onConfirm={handleRemoveRackConfirm}
      />
    </ScrollView>
  );
};

export default EditRack;
