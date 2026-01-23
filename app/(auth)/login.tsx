/* eslint-disable react/no-unescaped-entities */

import { EmailInput } from "@/components/auth/emailInput";
import { GoogleSignInButton } from "@/components/auth/googleSignInButton";
import { PasswordInput } from "@/components/auth/passwordInput";
import { Divider } from "@/components/shared/divider";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { useAuth } from '@/contexts/AuthContext';
import useFetch from "@/hooks/useFetch";
import { cleanInput, validateEmail } from '@/utils/validation';
import { router, useNavigation } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import "../globals.css";
import { authService } from "@/services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoginInvalid, setIsLoginInvalid] = useState(false);
  const [emailError, setEmailError] = useState<string>("");

  const { signIn, googleSignInAndVerify } = useAuth();
  const navigation = useNavigation();

  const {
    refetch: checkNeedsOnboarding,
  } = useFetch('/api/auth/onboarding-status', {
    method: 'GET',
    autoFetch: false,
    withAuth: false,
  });

  const handleEmailChange = (value: string) => {
    setEmail(value);

    const trimmedEmail = value.trim();

    if (trimmedEmail === "") {
      setEmailError("");
      setIsLoginInvalid(false);
      return;
    } 

    if (validateEmail(trimmedEmail)) {
      setEmailError("");
      return;
    }

    setEmailError("Email is invalid");
  };

  const handlePasswordChange = (value: string) => {
    const cleaned = cleanInput(value);
    setPassword(cleaned);
    if (cleaned.trim() === "" || email.trim() === "") {
      setIsLoginInvalid(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    setIsLoginInvalid(false);

    try {
      await signIn(trimmedEmail, password);
      router.replace("/(tabs)/(home)");
    } catch (error) {
      setIsLoginInvalid(true);
      Alert.alert("Login Failed", "Invalid email or password. Please try again.");
      console.log("Login error:", error);
    } finally {
      setLoading(false);
    };
  }

  const handleGoogleSignIn = async () => {
    setIsLoginInvalid(false);
    setLoading(true);

    try {
      const { userData  } = await googleSignInAndVerify();

      if (!userData?.email) {
        Alert.alert("Google Sign-In Failed", "Unable to retrieve your email from Google.");
        return;
      }

      const email = userData.email.trim().toLowerCase();

      const onboardingResponse = await authService.onboardingStatus(checkNeedsOnboarding, email);
      const needsOnboarding = onboardingResponse.needsOnboarding;

      if (!onboardingResponse.success) {
        Alert.alert("Unable to proceed with Google Sign-In. Please try again.");
        console.log(onboardingResponse.message);
        return;
      }

      console.log("Onboarding status response:", onboardingResponse); 

      if (needsOnboarding) {
        const userInfoFromGoogle = {
          email: userData.email ?? "",
          firstName: userData.firstName ?? "",
          lastName: userData.lastName ?? "",
          token: userData.token ?? "",
        };

        await SecureStore.setItemAsync(
          "sso_temp_user_info",
          JSON.stringify(userInfoFromGoogle)
        );

        await SecureStore.setItemAsync("fromGoogle", "true");

        router.push({
          pathname: "/(auth)/signup/createUserInfo",
          params: { email },
        });
      } else {
        router.replace("/(tabs)/(home)");
      }
    } catch (error) {
      Alert.alert("Google Sign-In Failed", "Unable to sign in with Google. Please try again.");
      console.log("Google Sign-In error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleForgotPassword = () => {
    router.push("/(auth)/forgetpassword/forgotPassword1");
  };
  

  return (
    <View className="flex-1 bg-white px-[16px] pb-[34px] w-screen justify-between h-screen items-center">
      <Image
        source={require("@/assets/images/nurtura_logo.png")}
        className="w-[250px] h-[250px] mt-20"
        resizeMode="contain"
      />

      <View className="w-full mb-4 flex-1 justify-start gap-1">
        <EmailInput
          value={email}
          onChangeText={handleEmailChange}
          error={emailError}
          hasError={isLoginInvalid}
        />

        <PasswordInput
          value={password}
          onChangeText={handlePasswordChange}
          isVisible={isPasswordVisible}
          onToggleVisibility={togglePasswordVisibility}
          hasError={isLoginInvalid}
          type="login"
        />

        {isLoginInvalid && (
          <Text className="text-[#E65656] text-base mb-[10px] pl-2">
            Invalid login. Please try again.
          </Text>
        )}

        <Text className="ml-2 mt-2 text-base">
          Forgot password?{" "}
          <Text
            className="text-primary underline font-bold text-base"
            onPress={handleForgotPassword}
          >
            Reset here.
          </Text>
        </Text>

        <Divider />

        <GoogleSignInButton onPress={handleGoogleSignIn} disabled={loading} />
      </View>

      <View className="absolute bottom-10 w-full">
        <TouchableOpacity
          onPress={() => navigation.navigate("signup" as never)}
          className="mt-4 mb-5"
          disabled={loading}
        >
          <Text className="text-center text-gray-600 text-base">
            Don't have an account?{" "}
            <Text className="text-primary font-semibold underline text-base">
              Create one here.
            </Text>
          </Text>
        </TouchableOpacity>

        <PrimaryButton
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          title="Login"
        />
      </View>
    </View>
  );
}