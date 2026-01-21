import React from "react";
import { Image, Text, View } from "react-native";
import { typography } from "../../assets/fonts/Text";
import ClockIcon from "../../assets/images/clockIcon.png";
import LightIcon from "../../assets/images/lightUsedIcon.png";
import WaterIcon from "../../assets/images/wateredIcon.png";

interface Activity {
  id: string;
  type: "water" | "light";
  action: string;
  plant: string;
  timestamp: string;
  amount?: string;
  duration?: string;
}

interface RecentActivityBarProps {
  activities: Activity[];
}

const getIconConfig = (type: "water" | "light") => {
  const configs: Record<
    "water" | "light",
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
      <View className=" pb-4 px-4">
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
          activities.map((activity, index) => {
            const iconConfig = getIconConfig(activity.type);
            const isFirst = index === 0;
            const isLast = index === activities.length - 1;

            return (
              <View
                key={activity.id}
                className={`
                  px-3 py-5 flex-row items-center
                  border border-gray-200
                  ${!isLast ? "border-b-0" : ""}
                  ${isFirst ? "rounded-t-xl" : ""}
                  ${isLast ? "rounded-b-xl" : ""}
                `}
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
                      className="mb-6"
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
                        {activity.amount || activity.duration}
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
