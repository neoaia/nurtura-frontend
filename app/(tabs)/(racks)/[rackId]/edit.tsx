import RackNameIcon from "@/assets/images/icons/name.svg";
import RemovePlantIcon from "@/assets/images/icons/shovel.svg";
import RemoveRackIcon from "@/assets/images/icons/trash.svg";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { MenuCard } from "@/components/shared/menubtn";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

const EditRack = () => {
  const { rackId } = useLocalSearchParams<{ rackId: string }>();

  const [removePlantModal, setRemovePlantModal] = useState(false);
  const [removeRackModal, setRemoveRackModal] = useState(false);
  const [hasPlant, setHasPlant] = useState(false);
  const [currentPlantId, setCurrentPlantId] = useState<string | null>(null);

  const { refetch: getRackInfo } = useFetch(`/racks/${rackId}`, {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: deleteRackReq } = useFetch(`/racks/${rackId}`, {
    method: "DELETE",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: removePlantReq } = useFetch(`/racks/${rackId}/unassign`, {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchRack = async () => {
        try {
          const res = await rackService.getRackbyId(getRackInfo);
          if (isActive) {
            setHasPlant(!!res?.rack?.currentPlant);
            setCurrentPlantId(res?.rack?.currentPlantId ?? null);
          }
        } catch (err) {
          if (err instanceof Error && err.message === "Request was cancelled") {
            return;
          }
          console.error("Failed to fetch rack:", err);
        }
      };

      if (rackId) fetchRack();

      return () => {
        isActive = false;
      };
    }, [rackId, getRackInfo]),
  );

  const handleRemovePlantPress = useCallback(
    () => setRemovePlantModal(true),
    [],
  );
  const handleRemoveRackPress = useCallback(() => setRemoveRackModal(true), []);

  const handleRemovePlantConfirm = useCallback(async () => {
    if (!currentPlantId) return;

    try {
      const response = await rackService.removePlant(removePlantReq, {
        plantId: currentPlantId,
      });

      if (response) {
        setRemovePlantModal(false);
        Alert.alert("Success", "Plant removed successfully.");
        router.replace("/(tabs)/(racks)" as any);
      }
    } catch (error) {
      console.error("Failed to remove plant:", error);
      Alert.alert("Error", "Failed to remove the plant. Please try again.");
    } finally {
      setRemovePlantModal(false);
    }
  }, [removePlantReq, currentPlantId]);

  const handleRemoveRackConfirm = useCallback(async () => {
    try {
      const response = await rackService.deleteRackbyId(deleteRackReq);

      if (response) {
        setRemoveRackModal(false);
        Alert.alert("Success", "Nurtura Rack removed successfully.");
        router.replace("/(tabs)/(racks)" as any);
      }
    } catch (error) {
      console.error("Failed to delete rack:", error);
      Alert.alert("Error", "Failed to remove the rack. Please try again.");
    } finally {
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
      ...(hasPlant
        ? [
            {
              title: "Remove Plant",
              desc: "Remove the plant on your Nurtura Rack.",
              icon: RemovePlantIcon,
              iconSize: 20,
              type: "red" as const,
              onPress: handleRemovePlantPress,
            },
          ]
        : []),
      {
        title: "Remove Nurtura Rack",
        desc: "Remove this rack from your account.",
        icon: RemoveRackIcon,
        iconSize: 20,
        type: "red" as const,
        onPress: handleRemoveRackPress,
      },
    ],
    [
      hasPlant,
      handleEditNamePress,
      handleRemovePlantPress,
      handleRemoveRackPress,
    ],
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
