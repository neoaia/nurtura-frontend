import React from "react";
import { Image, Text, View } from "react-native";
import { typography } from "../../assets/fonts/Text";
import ClockIcon from "../../assets/images/clockIcon.png";
import LightIcon from "../../assets/images/lightUsedIcon.png";
import WaterIcon from "../../assets/images/wateredIcon.png";
import { ActivityDTO } from "../../types/home.dto";

interface RecentActivityBarProps {
  activities: ActivityDTO[];
}

const getIconConfig = (type: ActivityDTO["type"]) => {
  const configs: Record<
    ActivityDTO["type"],
    { icon: any; bgColor: string; textColor: string }
  > = {
    water: { icon: WaterIcon, bgColor: "#CFE6ED", textColor: "#619AAC" },
    light: { icon: LightIcon, bgColor: "#F1EEA2", textColor: "#D6C125" },
  };
  return configs[type];
};

export const RecentActivityBar: React.FC<RecentActivityBarProps> = ({
  activities,
}) => {
  return (
    <>
      <View className="pb-4 px-4">
        <Text style={typography["h2-bold"]} className="text-black">
          Recent Activity
        </Text>
      </View>

      <View>
        {activities.length === 0 ? (
          <View className="p-8 items-center border border-gray-200 rounded-xl">
            <Text style={typography.body} className="text-grayText">
              No recent activities
            </Text>
          </View>
        ) : (
          activities.map((activity) => {
            const iconConfig = getIconConfig(activity.type);

            return (
              <View
                key={activity.id}
                className="p-3 bg-white mb-2 py-5 pr-3 pl-3 w-full flex-row items-center rounded-xl shadow-sm border border-gray-100"
              >
                <View
                  style={{ backgroundColor: iconConfig.bgColor }}
                  className="rounded-2xl p-3 mr-6 w-14 h-14 items-center justify-center"
                >
                  <Image
                    source={iconConfig.icon}
                    className="w-5 h-5"
                    resizeMode="contain"
                  />
                </View>

                <View className="flex-1">
                  <Text
                    style={typography["subheader"]}
                    className="text-gray-700 mb-4"
                  >
                    {activity.action}{" "}
                    <Text
                      style={{
                        ...typography["subheader-bold"],
                        color: iconConfig.textColor,
                      }}
                    >
                      {activity.plant}
                    </Text>
                  </Text>

                  <View className="flex-row items-center gap-10">
                    <View className="flex-row items-center">
                      <Image
                        source={ClockIcon}
                        className="w-4 h-4 mr-2"
                        resizeMode="contain"
                      />
                      <Text style={typography.label} className="text-gray-600">
                        {activity.timestamp}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Image
                        source={iconConfig.icon}
                        className="w-4 h-4 mr-2"
                        resizeMode="contain"
                      />
                      <Text style={typography.label} className="text-gray-600">
                        {activity.duration}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </>
  );
};
