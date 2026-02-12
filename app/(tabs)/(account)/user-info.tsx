import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { typography } from "@/assets/fonts/Text";
import CloseIcon from "@/assets/images/icons/closeIcon.svg";
import EditIcon from "@/assets/images/icons/editIcon.svg";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { TextInputField } from "@/components/shared/textInputField";

export default function UserInformationScreen() {
  const [savedValues, setSavedValues] = useState({
    firstName: "Juan",
    middleName: "",
    lastName: "Dela Cruz",
    suffix: "",
    block: "",
    street: "",
    barangay: "",
    city: "",
  });

  const [formValues, setFormValues] = useState(savedValues);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasChanges = useMemo(() => {
    return Object.keys(savedValues).some(
      (key) =>
        savedValues[key as keyof typeof savedValues] !==
        formValues[key as keyof typeof formValues],
    );
  }, [formValues, savedValues]);

  const handleChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      setFormValues(savedValues);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleSubmitUserInfo = () => {
    setLoading(true);
    setTimeout(() => {
      setSavedValues(formValues);
      setIsEditing(false);
      setLoading(false);
      console.log("Updated!");
    }, 1000);
  };

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
          label="First Name"
          value={formValues.firstName}
          onChangeText={(text) => handleChange("firstName", text)}
          editable={isEditing}
        />

        <TextInputField
          label="Middle Name (optional)"
          value={formValues.middleName}
          onChangeText={(text) => handleChange("middleName", text)}
          editable={isEditing}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextInputField
              label="Last Name"
              value={formValues.lastName}
              onChangeText={(text) => handleChange("lastName", text)}
              editable={isEditing}
            />
          </View>

          <View className="w-[100px]">
            <TextInputField
              label="Suffix"
              value={formValues.suffix}
              onChangeText={(text) => handleChange("suffix", text)}
              editable={isEditing}
            />
          </View>
        </View>

        <Text
          style={typography["button-bold"]}
          className="text-black tracking-wide mb-3 mt-6"
        >
          Address
        </Text>

        <View className="flex-row gap-3 mb-1">
          <View className="w-[100px]">
            <TextInputField
              label="Block/No."
              value={formValues.block}
              onChangeText={(text) => handleChange("block", text)}
              editable={isEditing}
            />
          </View>

          <View className="flex-1">
            <TextInputField
              label="Street"
              value={formValues.street}
              onChangeText={(text) => handleChange("street", text)}
              editable={isEditing}
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextInputField
              label="Barangay"
              value={formValues.barangay}
              onChangeText={(text) => handleChange("barangay", text)}
              editable={isEditing}
            />
          </View>

          <View className="flex-1">
            <TextInputField
              label="City"
              value={formValues.city}
              onChangeText={(text) => handleChange("city", text)}
              editable={isEditing}
            />
          </View>
        </View>
      </ScrollView>

      {isEditing && hasChanges && (
        <View className="px-4 pb-20  bg-white border-t border-gray-100">
          <PrimaryButton
            onPress={handleSubmitUserInfo}
            loading={loading}
            title="Save Changes"
          />
        </View>
      )}
    </View>
  );
}
