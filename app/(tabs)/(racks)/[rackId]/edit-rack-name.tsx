import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useState,
} from "react";
import { ScrollView, View } from "react-native";

import CancelIcon from "@/assets/buttons/cancel.svg";
import SaveIcon from "@/assets/buttons/save.svg";
import EditIcon from "@/assets/images/icons/editIcon.svg";
import { InfoModal } from "@/components/modals/infoModal";
import { TextInputFieldSkeleton } from "@/components/shared/skeleton/textInputFieldSkeleton";
import { TextInputField } from "@/components/shared/textInputField";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService";
import { cleanNameInput } from "@/utils/validation";
import { useLocalSearchParams, useNavigation } from "expo-router";

export default function EditRackName() {
  const { rackId } = useLocalSearchParams<{ rackId: string }>();
  const navigation = useNavigation();

  const [rackData, setRackData] = useState<any>(null);
  const [savedRackName, setSavedRackName] = useState("");
  const [rackName, setRackName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [onModalConfirm, setOnModalConfirm] = useState<() => void>(() => {});

  const showModal = (
    title: string,
    message: string,
    onConfirm: () => void = () => setModalVisible(false),
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setOnModalConfirm(() => onConfirm);
    setModalVisible(true);
  };

  const { refetch: getRackInfo } = useFetch(`/racks/${rackId}`, {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: updateRack } = useFetch(`/racks/${rackId}`, {
    method: "PATCH",
    autoFetch: false,
    withAuth: true,
  });

  useEffect(() => {
    let isActive = true;

    const fetchRackData = async () => {
      try {
        if (isActive) setLoading(true);
        const response = await rackService.getRackbyId(getRackInfo);

        if (isActive && response?.rack) {
          setRackData(response.rack);
          setSavedRackName(response.rack.name);
          setRackName(response.rack.name);
          setLoading(false);
        }
      } catch (error) {
        showModal("Error", "Failed to load rack information");
      }
    };

    if (rackId) fetchRackData();

    return () => {
      isActive = false;
    };
  }, [rackId]);

  const hasChanges = savedRackName !== rackName && rackName.trim() !== "";

  const handleCancel = useCallback(() => {
    setRackName(savedRackName);
    setIsEditing(false);
  }, [savedRackName]);

  const handleSave = useCallback(async () => {
    if (!rackName.trim()) {
      showModal("Error", "Rack name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: rackName.trim(),
        mqttTopic: rackData?.mqttTopic || "",
        description: rackData?.description || "",
      };

      console.log("Sending update data:", updateData);

      const response = await rackService.updateRackbyId(updateRack, updateData);

      if (response) {
        setSavedRackName(rackName.trim());
        setIsEditing(false);
        showModal("Success", "Rack name updated successfully", () => {
          setIsEditing(false);
          setModalVisible(false);
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      showModal("Error", "Failed to update rack name");
    } finally {
      setSaving(false);
      console.log("Updated rack name:", rackName.trim());
    }
  }, [rackName, rackData, updateRack]);

  useLayoutEffect(() => {
    if (loading) {
      navigation.setOptions({ headerRight: undefined });
      return;
    }

    if (isEditing) {
      navigation.setOptions({
        headerRight: () => (
          <View className="flex-row items-center gap-4 pr-2">
            <DebouncedTouchableOpacity onPress={handleCancel} hitSlop={8}>
              <CancelIcon width={22} height={22} />
            </DebouncedTouchableOpacity>
            {hasChanges && (
              <DebouncedTouchableOpacity
                onPress={handleSave}
                disabled={saving}
                hitSlop={8}
              >
                <SaveIcon width={22} height={22} />
              </DebouncedTouchableOpacity>
            )}
          </View>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => (
          <DebouncedTouchableOpacity
            onPress={() => setIsEditing(true)}
            className="pr-2"
            hitSlop={8}
          >
            <EditIcon width={22} height={22} />
          </DebouncedTouchableOpacity>
        ),
      });
    }
  }, [isEditing, loading, hasChanges, saving, handleCancel, handleSave]);

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="px-6 pt-4"
      >
        {loading ? (
          <TextInputFieldSkeleton />
        ) : (
          <TextInputField
            label="Rack Name"
            value={rackName}
            onChangeText={(text) => setRackName(cleanNameInput(text))}
            editable={isEditing}
            placeholder="Enter rack name"
          />
        )}
      </ScrollView>

      <InfoModal
        isVisible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onConfirm={() => {
          onModalConfirm();
          setModalVisible(false);
        }}
      />
    </View>
  );
}
