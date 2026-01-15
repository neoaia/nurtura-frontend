import React from 'react';
import { Text, View } from 'react-native';

interface plantStatusIndicators {
  type: 'temperature' | 'humidity' | 'soil-moisture';
  value: string | number;
  label?: string;
}

const getCardConfig = (type: plantStatusIndicators['type']) => {
  switch (type) {
    case 'temperature':
      return {
        bgColor: 'bg-[#FFBE96]',
        textColor: 'text-[#C4733B]',
        label: 'Temp (C)',
      };
    case 'humidity':
      return {
        bgColor: 'bg-[#CFE6ED]',
        textColor: 'text-[#619AAC]',
        label: 'Humidity',
      };
    case 'soil-moisture':
      return {
        bgColor: 'bg-[#FFE6B2]',
        textColor: 'text-[#C29D50]',
        label: 'Soil Moisture',
      };
  }
};

const PlantStatusIndicators: React.FC<plantStatusIndicators> = ({ type, value, label }) => {
  const config = getCardConfig(type);
  const displayLabel = label || config.label;

  return (
    <View className="items-center bg-white rounded-xl p-4 shadow-md border border-gray-100 w-32 mx-2">
      <View className={`w-12 h-12 ${config.bgColor} rounded-xl items-center justify-center mb-3`}>
      </View>

      <Text className={`text-sm font-medium ${config.textColor} mb-1`}>
        {displayLabel}
      </Text>

      <Text className={`text-base font-bold ${config.textColor}`}>
        {value}
      </Text>
    </View>
  );
};

export default PlantStatusIndicators;