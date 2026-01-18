import React from "react";
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { typography } from "../../assets/fonts/Text";
import PlantsIcon from "../../assets/images/plantIcon.png";
import RacksIcon from "../../assets/images/rackIcon.png";

interface SummaryCardProps {
  cards: {
    id: string;
    type: string;
    value: number | null;
  }[];
  onCardPress: (type: string) => void;
}

const SUMMARY_CONFIG: Record<
  string,
  {
    icon: ImageSourcePropType;
    title: string;
    subtitle: string;
  }
> = {
  racks: {
    icon: RacksIcon,
    title: "Racks",
    subtitle: "Active",
  },
  plants: {
    icon: PlantsIcon,
    title: "Plants",
    subtitle: "All Types",
  },
};

export const SummaryCard: React.FC<SummaryCardProps> = ({
  cards,
  onCardPress,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-6"
      contentContainerStyle={{ paddingRight: 16 }}
    >
      {cards.map((card) => {
        const config = SUMMARY_CONFIG[card.type];

        if (!config) return null;

        return (
          <TouchableOpacity
            key={card.id}
            onPress={() => onCardPress(card.type)}
            className="bg-white/20 backdrop-blur rounded-2xl p-5 mr-4"
            style={{ width: 240 }}
            activeOpacity={0.7}
          >
            <View className="flex-row items-start justify-between mb-4">
              <View className="bg-white/40 rounded-xl p-3 w-14 h-14 items-center justify-center">
                <Image
                  source={config.icon}
                  className="w-8 h-8"
                  resizeMode="contain"
                />
              </View>

              {card.value !== null && (
                <Text style={typography["title-bold"]} className="text-white">
                  {card.value}
                </Text>
              )}
            </View>

            <Text style={typography["h2-bold"]} className="text-white mb-1">
              {config.title}
            </Text>

            <Text style={typography['subheader']} className="text-white opacity-90">
              {config.subtitle}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
