import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

import CancelIcon from "@/assets/buttons/cancel.svg";
import SaveIcon from "@/assets/buttons/save.svg";
import EditIcon from "@/assets/images/icons/editIcon.svg";
import { TextInputFieldSkeleton } from "@/components/shared/skeleton/textInputFieldSkeleton";
import { TextInputField } from "@/components/shared/textInputField";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService";
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

  const { refetch: getRackInfo } = useFetch(`/api/racks/${rackId}`, {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: updateRack } = useFetch(`/api/racks/${rackId}`, {
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
        Alert.alert("Error", "Failed to load rack information");
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
      Alert.alert("Error", "Rack name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const response = await rackService.updateRackbyId(updateRack, {
        name: rackName.trim(),
        mqttTopic: rackData?.mqttTopic || "",
        description: rackData?.description || "",
      });

      if (response) {
        setSavedRackName(rackName.trim());
        setIsEditing(false);
        Alert.alert("Success", "Rack name updated successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update rack name");
    } finally {
      setSaving(false);
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
            <TouchableOpacity onPress={handleCancel} hitSlop={8}>
              <CancelIcon width={22} height={22} />
            </TouchableOpacity>
            {hasChanges && (
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                hitSlop={8}
              >
                <SaveIcon width={22} height={22} />
              </TouchableOpacity>
            )}
          </View>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            className="pr-2"
            hitSlop={8}
          >
            <EditIcon width={22} height={22} />
          </TouchableOpacity>
        ),
      });
    }
  }, [isEditing, loading, hasChanges, saving]);

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
            onChangeText={setRackName}
            editable={isEditing}
            placeholder="Enter rack name"
          />
        )}
      </ScrollView>
    </View>
  );
}
