import React, { useState } from "react";
import { ScrollView, View } from "react-native";

import { ConfirmationModal } from "@/components/modals/confirmationModal";
import CurrentConnection from "@/components/racks/currentConnection";
import { RemoveConnectionButton } from "@/components/racks/removeConnectionButton";
import { HollowButton } from "@/components/shared/hollowButton";

export default function Connection() {
  const [changeConModal, setChangeConModal] = useState(false);
  const [removeConModal, setRemoveConModal] = useState(false);

  const handleChangeConPress = () => {
    setChangeConModal(true);
  };

  const handleRemoveConPress = () => {
    setRemoveConModal(true);
  };

  const handleChangeConConfirm = () => {
    console.log("Plant removed!");
    setChangeConModal(false);
  };

  const handleRemoveConConfirm = () => {
    console.log("Rack removed!");
    setRemoveConModal(false);
  };

  return (
    <View className="flex-1 px-4 bg-white pb-9">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="mt-6">
          <CurrentConnection connectionName={"My Home"}></CurrentConnection>
        </View>
      </ScrollView>

      <View className="flex-col gap-2">
        <HollowButton
          title="Change Connection"
          onPress={handleChangeConPress}
        ></HollowButton>
        <RemoveConnectionButton
          title={"Remove Connection"}
          onPress={handleRemoveConPress}
        ></RemoveConnectionButton>
      </View>

      <ConfirmationModal
        isVisible={changeConModal}
        title="Change current connection?"
        message="This action cannot be undone."
        onCancel={() => setChangeConModal(false)}
        onConfirm={handleChangeConConfirm}
      />

      <ConfirmationModal
        isVisible={removeConModal}
        title="Remove your current connection?"
        message="This action cannot be undone."
        onCancel={() => setRemoveConModal(false)}
        onConfirm={handleRemoveConConfirm}
      />
    </View>
  );
}
