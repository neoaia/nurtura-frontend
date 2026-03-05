import { MenuCard } from "@/components/shared/menubtn";

import EmailIcon from "@/assets/images/icons/email.svg";
import PasswordIcon from "@/assets/images/icons/key.svg";
import { createLogger } from "@/utils/logger";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

const logger = createLogger("AccountSecurityScreen");

export default function AccountSecurityScreen() {
  const [isGoogleUser, setIsGoogleUser] = useState<boolean>(false);

  useEffect(() => {
    const checkUserProvider = async () => {
      try {
        logger.log("Checking auth provider from storage...");
        const authProvider = await SecureStore.getItemAsync("auth_provider");
        logger.log("Auth provider:", authProvider);
        if (authProvider === "google") {
          setIsGoogleUser(true);
          logger.log("User is Google-only - hiding Account Security options");
        } else {
          setIsGoogleUser(false);
          logger.log(
            "User has password auth - showing Account Security options",
          );
        }
      } catch (error) {
        logger.error("Error checking auth provider:", error);
        setIsGoogleUser(false);
      }
    };
    checkUserProvider();
  }, []);

  const menuItems = [
    {
      title: "Change Password",
      desc: "Update your password to secure account.",
      icon: PasswordIcon,
      path: "/(tabs)/(account)/change-password-1",
      showCondition: !isGoogleUser,
    },
    {
      title: "Update E-mail",
      desc: "Update your e-mail to stay connected.",
      icon: EmailIcon,
      path: "/(tabs)/(account)/update-email-1",
      showCondition: !isGoogleUser,
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => item.showCondition);

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="bg-white">
      <View className="flex justify-start items-center px-4">
        {visibleMenuItems.map((item) => (
          <View key={item.path} className="w-full mb-3">
            <MenuCard
              title={item.title}
              description={item.desc}
              icon={item.icon}
              route={item.path as any}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
