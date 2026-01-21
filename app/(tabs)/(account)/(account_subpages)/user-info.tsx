import React, { useState } from "react";
import { ScrollView, View } from "react-native";

import { TextInputField } from "@/components/shared/textInputField";

export default function UserInformationScreen() {
  const [username, setUsername] = useState("JuanMasipag");
  const [firstName, setFirstName] = useState("Juan");
  const [lastName, setLastName] = useState("Dela Cruz");

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
      className="bg-white"
    >
      <View className="px-6 mt-6">
        {/* Username (full width) */}
        <TextInputField
          label="Username"
          value={username}
          onChangeText={setUsername}
        />

        {/* First & Last Name (row) */}
        <View className="flex-row justify-between">
          <TextInputField
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            width="w-[48%]"
          />
          <TextInputField
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            width="w-[48%]"
          />
        </View>
      </View>
    </ScrollView>
  );
}
