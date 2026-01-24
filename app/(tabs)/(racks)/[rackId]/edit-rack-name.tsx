import React, { useState } from "react";
import { ScrollView, View } from "react-native";

import { TextInputField } from "@/components/shared/textInputField";

export default function EditRackName() {
  const [rackName, setRackName] = useState("My First Rack");

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
      className="bg-white"
    >
      <View className="px-6 mt-6">
        <TextInputField
          label="Rack Name"
          value={rackName}
          onChangeText={setRackName}
        />
      </View>
    </ScrollView>
  );
}
