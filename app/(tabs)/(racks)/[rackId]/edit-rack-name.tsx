import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { typography } from "@/assets/fonts/Text";
import CloseIcon from "@/assets/images/icons/closeIcon.svg";
import EditIcon from "@/assets/images/icons/editIcon.svg";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { TextInputField } from "@/components/shared/textInputField";
import useFetch from "@/hooks/useFetch";
import { rackService } from "@/services/rackService";
import { useLocalSearchParams } from "expo-router";

export default function EditRackName() {
  const { rackId } = useLocalSearchParams<{ rackId: string }>();

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
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load rack information");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    if (rackId) {
      fetchRackData();
    }

    return () => {
      isActive = false;
    };
  }, [rackId]);

  const hasChanges = savedRackName !== rackName && rackName.trim() !== "";

  const handleToggleEdit = useCallback(() => {
    if (isEditing) {
      setRackName(savedRackName);
    }
    setIsEditing((prev) => !prev);
  }, [isEditing, savedRackName]);

  const handleSave = async () => {
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
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#86975A" />
        <Text style={typography["subheader"]} className="text-gray-500 mt-4">
          Loading rack information...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-end px-6 pt-6">
        <TouchableOpacity onPress={handleToggleEdit}>
          {isEditing ? (
            <CloseIcon width={22} height={22} />
          ) : (
            <EditIcon width={22} height={22} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="px-6 pt-4"
      >
        <TextInputField
          label="Rack Name"
          value={rackName}
          onChangeText={setRackName}
          editable={isEditing}
          placeholder="Enter rack name"
        />

        {!isEditing && (
          <Text style={typography["label"]} className="text-gray-500 mt-2 px-2">
            Tap the edit icon to change the rack name
          </Text>
        )}
      </ScrollView>

      {isEditing && hasChanges && (
        <View className="px-4 pb-20 bg-white border-t border-gray-100">
          <PrimaryButton
            onPress={handleSave}
            loading={saving}
            title="Save Changes"
          />
        </View>
      )}
    </View>
  );
}
