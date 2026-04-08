/* eslint-disable react/no-unescaped-entities */

import { typography } from "@/assets/fonts/Text";
import { EmailInput } from "@/components/auth/emailInput";
import { GoogleSignInButton } from "@/components/auth/googleSignInButton";
import { PasswordInput } from "@/components/auth/passwordInput";
import { InfoModal } from "@/components/modals/infoModal";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { Divider } from "@/components/shared/divider";
import { PrimaryButton } from "@/components/shared/primaryButton";
import { useAuth } from "@/contexts/AuthContext";
import useFetch from "@/hooks/useFetch";
import { authService } from "@/services/authService";
import { NavigationService, ROUTES } from "@/utils/navigationUtils";
import { cleanInput, validateEmail } from "@/utils/validation";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { Image, Text, View } from "react-native";
import "../globals.css";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoginInvalid, setIsLoginInvalid] = useState(false);
  const [emailError, setEmailError] = useState<string>("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [onModalConfirm, setOnModalConfirm] = useState<() => void>(() => {});

  const showModal = (
    title: string,
    message: string,
    onConfirm: () => void = () => setModalVisible(false),
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setOnModalConfirm(() => onConfirm);
    setModalVisible(true);
  };

  const router = useRouter();
  const navService = new NavigationService(router);
  const { signIn, googleSignInAndVerify } = useAuth();

  const { refetch: checkNeedsOnboarding } = useFetch(
    "/auth/onboarding-status",
    {
      method: "GET",
      autoFetch: false,
      withAuth: false,
    },
  );

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
      showModal("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    setIsLoginInvalid(false);

    try {
      await signIn(trimmedEmail, password);
      await SecureStore.setItemAsync("user_email", trimmedEmail);
      await SecureStore.setItemAsync("auth_provider", "password");
      // Use replace to prevent back navigation to login
      navService.replace(ROUTES.TABS.HOME.INDEX);
    } catch (error) {
      setIsLoginInvalid(true);
      showModal("Login Failed", "Invalid email or password. Please try again.");
      console.log("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoginInvalid(false);
    setLoading(true);

    try {
      const { userData } = await googleSignInAndVerify();

      if (!userData?.email) {
        showModal(
          "Google Sign-In Failed",
          "Unable to retrieve your email from Google.",
        );
        return;
      }

      const email = userData.email.trim().toLowerCase();

      await SecureStore.setItemAsync("user_email", email);
      await SecureStore.setItemAsync("auth_provider", "google");

      const onboardingResponse = await authService.onboardingStatus(
        checkNeedsOnboarding,
        email,
      );
      const needsOnboarding = onboardingResponse.needsOnboarding;

      if (!onboardingResponse.success) {
        showModal(
          "Error",
          "Unable to proceed with Google Sign-In. Please try again.",
        );
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
          JSON.stringify(userInfoFromGoogle),
        );

        await SecureStore.setItemAsync("fromGoogle", "true");

        // Use push to allow back navigation within signup flow
        navService.push(ROUTES.AUTH.SIGNUP.CREATE_USER_INFO, { email });
      } else {
        // Use replace to prevent back to login after successful auth
        navService.replace(ROUTES.TABS.HOME.INDEX);
      }
    } catch (error) {
      showModal(
        "Google Sign-In Failed",
        "Unable to sign in with Google. Please try again.",
      );
      console.log("Google Sign-In error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navService.push(ROUTES.AUTH.FORGOT_PASSWORD.STEP_1);
  };

  return (
    <View className="flex-1 bg-white px-[16px] pb-[34px] w-screen justify-between h-screen items-center">
      <Image
        source={require("@/assets/images/nurtura_logo.png")}
        className="w-48 h-48 mt-20"
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
          <Text
            style={typography["subheader"]}
            className="text-[#E65656] mb-[10px] pl-2"
          >
            Invalid login. Please try again.
          </Text>
        )}

        <View className="ml-2 mt-2 flex-row flex-wrap items-center">
          <Text style={typography["subheader"]} className="text-grayText">
            Forgot password?{" "}
          </Text>
          <DebouncedTouchableOpacity
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text
              style={typography["subheader-bold"]}
              className="text-primary underline"
            >
              Reset here.
            </Text>
          </DebouncedTouchableOpacity>
        </View>

        <Divider />

        <GoogleSignInButton onPress={handleGoogleSignIn} disabled={loading} />
      </View>

      <View className="absolute bottom-10 w-full">
        <DebouncedTouchableOpacity
          onPress={() => navService.push(ROUTES.AUTH.SIGNUP.ROOT)}
          className="mt-4 mb-5"
          disabled={loading}
        >
          <Text
            className="text-center text-grayText"
            style={typography["subheader"]}
          >
            Don't have an account?{" "}
            <Text
              style={typography["subheader-bold"]}
              className="text-primary underline"
            >
              Create one here.
            </Text>
          </Text>
        </DebouncedTouchableOpacity>

        <PrimaryButton
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          title="Login"
        />
      </View>

      <InfoModal
        isVisible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onConfirm={() => {
          onModalConfirm();
          setModalVisible(false);
        }}
      />
    </View>
  );
}
