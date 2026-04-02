import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

import { typography } from "../../assets/fonts/Text";
import PlantsIcon from "../../assets/images/icons/plant.svg";
import RacksIcon from "../../assets/images/icons/rack(Add).svg";
import { SummaryCardDTO } from "../../types/home.dto";

interface SummaryCardProps {
  cards: SummaryCardDTO[];
  onCardPress: (cardType: string) => void;
}

const ICON_SIZE = 20;

const SUMMARY_CONFIG: Record<
  string,
  {
    icon: React.FC<SvgProps>;
    title: string;
    subtitle: string;
  }
> = {
  racks: {
    icon: RacksIcon,
    title: "Racks",
    subtitle: "Owned",
  },
  plants: {
    icon: PlantsIcon,
    title: "Seeds",
    subtitle: "Planted",
  },
};

export const SummaryCard: React.FC<SummaryCardProps> = ({
  cards,
  onCardPress,
}) => {
  return (
    <View className="flex-row w-full px-4 justify-between">
      {cards.map((card, index) => {
        const config = SUMMARY_CONFIG[card.type];

        if (!config) return null;

        const Icon = config.icon;

        // Add a right margin to the first card, and left margin to the second
        // to create an even gap between them while staying within screen bounds.
        const marginClass = index === 0 ? "mr-2" : "ml-2";

        return (
          <TouchableOpacity
            key={card.id}
            onPress={() => onCardPress(card.type)}
            className={`flex-1 bg-primary border border-primary rounded-2xl py-5 px-4 my-1 ${marginClass}`}
            style={{
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                },
                android: {
                  elevation: 4,
                },
              }),
            }}
            activeOpacity={0.7}
          >
            <View className="flex-row items-start justify-between mb-4">
              <View className="bg-[#E5EDCF] rounded-xl p-4 items-center justify-center mb-2">
                <Icon width={ICON_SIZE} height={ICON_SIZE} />
              </View>

              {card.value !== null && (
                <Text style={typography["title-bold"]} className="text-white">
                  {card.value}
                </Text>
              )}
            </View>

            <Text style={typography["h2-bold"]} className="text-white">
              {config.title}
            </Text>

            <Text
              style={typography["subheader"]}
              className="text-white opacity-80"
            >
              {config.subtitle}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
