/* eslint-disable react/no-unescaped-entities */

import { EmailInput } from "@/components/auth/emailInput";
import { GoogleSignInButton } from "@/components/auth/googleSignInButton";
import { PasswordInput } from "@/components/auth/passwordInput";
import { Divider } from "@/components/shared/divider";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { useLogin } from "@/hooks/auth/useLogin";
import { router, useNavigation } from "expo-router";
import { Image, Text, TouchableOpacity, View, Alert } from "react-native";
import "../globals.css";
import { useEffect, useState } from "react";
import { useAuth } from '@/contexts/AuthContext'
import { cleanInput, validateEmail } from '@/utils/validation'

export default function LoginScreen() {
  // const {
  //   email,
  //   password,
  //   loading,
  //   isPasswordVisible,
  //   isLoginInvalid,
  //   emailError,
  //   handleEmailChange,
  //   handlePasswordChange,
  //   togglePasswordVisibility,
  //   handleLogin,
  //   handleGoogleSignIn,
  // } = useLogin();

  // const navigation = useNavigation();

  // const handleForgotPassword = () => {
  //   router.push("/(auth)/forgetpassword/forgotPassword1");
  // };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoginInvalid, setIsLoginInvalid] = useState(false);
  const [emailError, setEmailError] = useState<string>("");

  const { signIn, googleSignIn } = useAuth();
  const navigation = useNavigation();

  const handleEmailChange = (value: string) => {
    const cleanedEmail = cleanInput(value);
    setEmail(cleanedEmail );
    
    if (cleanedEmail.trim() === "") {
      setEmailError("");
      setIsLoginInvalid(false);
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
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    setIsLoginInvalid(false);

    try {
      await signIn(email, password);
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
      const success = await googleSignIn();

      if (success) {
        router.replace("/(tabs)/(home)");
      } else {
        setIsLoginInvalid(true);
        Alert.alert("Google Sign-In Failed", "Unable to sign in with Google. Please try again.");
      }
    } catch (error) {
      setIsLoginInvalid(true);
      Alert.alert("Google Sign-In Failed", "Unable to sign in with Google. Please try again.");
      console.log("Google Sign-In error:", error);
    } finally {
      setLoading(false);
    };
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