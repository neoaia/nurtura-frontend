import React from "react";
import { Text, View } from "react-native";
import { typography } from "../../assets/fonts/Text";
import { ActivityDTO } from "../../types/home.dto";

// Water SVGs
import WaterActivityIcon from "../../assets/images/icons/home/water_activity/activity_main.svg";
import WaterDurationIcon from "../../assets/images/icons/home/water_activity/duration.svg";
import WaterClockIcon from "../../assets/images/icons/home/water_activity/time.svg";

// Light SVGs
import LightActivityIcon from "../../assets/images/icons/home/light_activity/activity_main.svg";
import LightDurationIcon from "../../assets/images/icons/home/light_activity/duration.svg";
import LightClockIcon from "../../assets/images/icons/home/light_activity/time.svg";

interface RecentActivityBarProps {
  activities: ActivityDTO[];
}

const getIconConfig = (type: ActivityDTO["type"]) => {
  const configs: Record<
    ActivityDTO["type"],
    {
      ActivityIcon: React.FC<{ width: number; height: number }>;
      ClockIcon: React.FC<{ width: number; height: number }>;
      DurationIcon: React.FC<{ width: number; height: number }>;
      bgColor: string;
      textColor: string;
    }
  > = {
    water: {
      ActivityIcon: WaterActivityIcon,
      ClockIcon: WaterClockIcon,
      DurationIcon: WaterDurationIcon,
      bgColor: "#CFE6ED",
      textColor: "#619AAC",
    },
    light: {
      ActivityIcon: LightActivityIcon,
      ClockIcon: LightClockIcon,
      DurationIcon: LightDurationIcon,
      bgColor: "#F1EEA2",
      textColor: "#D6C125",
    },
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
            <Text style={typography["subheader"]} className="text-grayText">
              No recent activities
            </Text>
          </View>
        ) : (
          activities.map((activity) => {
            const {
              ActivityIcon,
              ClockIcon,
              DurationIcon,
              bgColor,
              textColor,
            } = getIconConfig(activity.type);

            return (
              <View
                key={activity.id}
                className="p-3 bg-white mb-2 py-5 pr-3 pl-3 w-full flex-row items-center rounded-xl shadow-sm border border-gray-100"
              >
                <View
                  style={{ backgroundColor: bgColor }}
                  className="rounded-2xl p-3 mr-6 w-14 h-14 items-center justify-center"
                >
                  <ActivityIcon width={20} height={20} />
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
                        color: textColor,
                      }}
                    >
                      {activity.plant}
                    </Text>
                  </Text>

                  <View className="flex-row items-center gap-10">
                    <View className="flex-row items-center">
                      <ClockIcon width={16} height={16} />
                      <Text
                        style={typography.label}
                        className="text-gray-600 ml-2"
                      >
                        {activity.timestamp}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <DurationIcon width={16} height={16} />
                      <Text
                        style={typography.label}
                        className="text-gray-600 ml-2"
                      >
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
