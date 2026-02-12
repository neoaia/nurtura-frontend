import { typography } from "@/assets/fonts/Text";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangePicker = ({ value, onChange }: Props) => {
  const [mode, setMode] = useState<"start" | "end" | null>(null);

  const handleOpenPicker = () => {
    if (mode !== null) return;
    setMode("start");
  };

  const formatRange = () => {
    if (!value.start || !value.end) return "Select date range";

    const sameYear = value.start.getFullYear() === value.end.getFullYear();

    const startText = value.start.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" }),
    });

    const endText = value.end.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return `${startText} – ${endText}`;
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handleOpenPicker} // Use the guarded function
        disabled={mode !== null} // Disable button while picker is active
        className={`flex-row items-center justify-between border-[2px] border-grayText rounded-xl py-3 px-4 bg-white ${
          mode !== null ? "opacity-70" : ""
        }`}
      >
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <Text style={typography["subheader"]} className="ml-3 text-black ">
            {formatRange()}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      {mode === "start" && (
        <DateTimePicker
          value={value.start ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            if (!date) {
              setMode(null);
              return;
            }
            onChange({ start: date, end: null });
            setMode("end");
          }}
        />
      )}

      {mode === "end" && (
        <DateTimePicker
          value={value.end ?? value.start ?? new Date()}
          minimumDate={value.start ?? undefined}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setMode(null);
            if (date) {
              onChange({ start: value.start, end: date });
            }
          }}
        />
      )}
    </View>
  );
};
