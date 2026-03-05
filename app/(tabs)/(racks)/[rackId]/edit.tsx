import RackNameIcon from "@/assets/images/icons/name.svg";
import RemovePlantIcon from "@/assets/images/icons/shovel.svg";
import RemoveRackIcon from "@/assets/images/icons/trash.svg";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { MenuCard } from "@/components/shared/menubtn";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

const EditRack = () => {
  const { rackId } = useLocalSearchParams<{ rackId: string }>();

  const [removePlantModal, setRemovePlantModal] = useState(false);
  const [removeRackModal, setRemoveRackModal] = useState(false);

  // ✅ 1. I-setup ang useFetch para sa DELETE request
  const { refetch: deleteRackReq } = useFetch(`/api/racks/${rackId}`, {
    method: "DELETE",
    autoFetch: false,
    withAuth: true,
  });

  const handleRemovePlantPress = useCallback(
    () => setRemovePlantModal(true),
    [],
  );
  const handleRemoveRackPress = useCallback(() => setRemoveRackModal(true), []);

  const handleRemovePlantConfirm = useCallback(() => {
    setRemovePlantModal(false);
  }, []);

  // ✅ 2. Gawing async at tawagin ang rackService.deleteRackbyId
  const handleRemoveRackConfirm = useCallback(async () => {
    try {
      const response = await rackService.deleteRackbyId(deleteRackReq);

      if (response) {
        setRemoveRackModal(false);
        Alert.alert("Success", "Nurtura Rack removed successfully.");

        // ✅ 3. I-redirect ang user pabalik sa main list para iwas error
        router.replace("/(tabs)/(racks)" as any);
      }
    } catch (error) {
      console.error("Failed to delete rack:", error);
      Alert.alert("Error", "Failed to remove the rack. Please try again.");
    } finally {
      // Siguraduhing magsasara ang modal kahit mag-error
      setRemoveRackModal(false);
    }
  }, [deleteRackReq]);

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
        icon: RackNameIcon,
        onPress: handleEditNamePress,
      },
      {
        title: "Remove Plant",
        desc: "Remove the plant on your Nurtura Rack.",
        icon: RemovePlantIcon,
        iconSize: 20,
        type: "red" as const,
        onPress: handleRemovePlantPress,
      },
      {
        title: "Remove Nurtura Rack",
        desc: "Remove this rack from your account.",
        icon: RemoveRackIcon,
        iconSize: 20,
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
              icon={item.icon}
              iconSize={item.iconSize}
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
