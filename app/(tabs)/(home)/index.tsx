import { useAuth } from "@/contexts/AuthContext";
import { auth } from '@/firebase';
import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useFetch from "@/hooks/useFetch";
import { UserInfo } from "@/types/interface";
import { router } from "expo-router";

const LOCAL_IP = process.env.EXPO_PUBLIC_LOCAL_IP_ADDRESS;
const PORT = process.env.EXPO_PUBLIC_PORT;

interface FetchUserResponse {
  userInfo: UserInfo;
}

export default function NurturaWelcome() {
  // const { logout } = useAuth();
  // const currentUser = auth.currentUser;
  // const emailToSend = currentUser?.email?.trim().toLowerCase() || "";

  // const { data, error, loading, refetch } = useFetch<FetchUserResponse>(
  //   `http://${LOCAL_IP}:${PORT}/users/fetch-userinfo`,
  //   {
  //     method: 'POST',
  //     body: { email: emailToSend },
  //     autoFetch: !!emailToSend,
  //   }
  // );

  // useEffect(() => {
  //   if (error) {
  //     console.error("Fetch user info failed:", error);
  //     Alert.alert("Error", "Unable to fetch profile data.");
  //   }
  // }, [error]);

  // useEffect(() => {
  //   if (data) {
  //     console.log("User info fetched:", data.userInfo);
  //   }
  // }, [data]);

  // const userInfo = data?.userInfo;
  

  // const fullName = `${userInfo?.first_name || "—"} ${userInfo?.last_name || ""}`;
  // // const age = userInfo?.birthdate
  // //   ? Math.floor((new Date().getTime() - new Date(userInfo.birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365))
  // //   : "—";

    const { logout } = useAuth();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [error, setError] = useState<any>(null);

  const handleLogout = async () => {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                await logout();
                router.replace('/(auth)/login');
              } catch (error: any) {
                Alert.alert('Error', error.message);
              }
            },
          },
        ]
      );
    };

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.username}>{userInfo ? `${userInfo.first_name || "—"} ${userInfo.last_name || ""}` : "—"}</Text>
        </View>

        {/* <Image
          source={require("@/assets/images/google.png")}
          style={styles.avatarPlaceholder}
          resizeMode="cover"
        /> */}
      </View>

      {/* <View style={styles.centerSection}>
        <Image
          source={require("@/assets/images/nurturaRack.png")}
          style={styles.plantImage}
          resizeMode="contain"
        />

        <View style={styles.messageContainer}>
          <Text style={styles.boldText}>
            <Text style={styles.placeholder}>{userInfo?.first_name || "—"}</Text>, doesn't have a Nurtura Rack
          </Text>
        </View>
      </View> */}

      <View className="flex-1 bg-white px-6 justify-center">
        <View className="bg-gray-100 rounded-lg p-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Logged in as:
          </Text>
          <Text className="text-base text-gray-600">{auth.currentUser?.email}</Text>
        </View>

        {userInfo ? (
            <>
              <Text className="text-base text-gray-700">
                <Text className="font-semibold">First Name: </Text>{userInfo.first_name || '—'}
              </Text>
              <Text className="text-base text-gray-700">
                <Text className="font-semibold">Midlle Name: </Text>{userInfo.middle_name || '—'}
              </Text>
              <Text className="text-base text-gray-700">
                <Text className="font-semibold">Last Name: </Text>{userInfo.last_name || '—'}
              </Text>
              <Text className="text-base text-gray-700">
                <Text className="font-semibold">Suffix: </Text>{userInfo.suffix || '—'}
              </Text>
              <Text className="text-base text-gray-700">
                <Text className="font-semibold">Address: </Text>{userInfo.address || '—'}
              </Text>
            </>
          ) : (
            <Text className="text-gray-500">No additional info found.</Text>
          )}

        {error && (
          <TouchableOpacity
            className="bg-blue-500 rounded-lg py-3 mb-4 active:bg-blue-600"
            onPress={() => refetch()}
          >
            <Text className="text-white text-center font-semibold">
              Retry Fetch
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="bg-red-500 rounded-lg py-4 active:bg-red-600"
          onPress={handleLogout}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Logout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-500 rounded-lg py-4 active:bg-gray-600 mt-10"
          onPress={() => router.push('/(tabs)/(home)/notification')}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Notification Test Routing
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 30,
    justifyContent: "space-between",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  welcome: {
    fontSize: 32,
    color: "#333",
    fontWeight: "600",
  },

  username: {
    fontSize: 30,
    color: "#000",
    fontWeight: "800",
    marginTop: 2,
    maxWidth: 220,
  },

  centerSection: {
    alignItems: "flex-start",
  },

   avatarPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#e5e5e5",
    borderRadius: 50,
  },

  plantImage: {
    width: 150,
    height: 150,
    backgroundColor: "transparent",
    marginBottom: 16,
  },

  messageContainer: {
    width: "85%",
  },

  boldText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },

  subText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  highlight: {
    color: "#7a934d",
    fontWeight: "700",
  },

  placeholder: {
    color: "#7a934d",
  },

  bottomSection: {
    alignItems: "flex-start",
  },

  infoBlock: {
    marginBottom: 26,
  },
});
