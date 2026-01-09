import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/firebase";
import {
    cleanAlphaInput,
    cleanAlphanumericInput,
    cleanNameInput,
} from "@/utils/validation";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export const USER_INFO_STORAGE_KEY = "temp_user_info";
export const SSO_INFO_STORAGE_KEY = "sso_temp_user_info";

export const useCreateUserInfo = () => {
  const LOCAL_IP = process.env.EXPO_PUBLIC_LOCAL_IP_ADDRESS;
  const PORT = process.env.EXPO_PUBLIC_PORT;

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [block, setBlock] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [fromGoogle, setFromGoogle] = useState("");
  const [firebaseToken, setFirebaseToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedData, setSavedData] = useState("");

  const { email, signUp } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const savedData = await SecureStore.getItemAsync(USER_INFO_STORAGE_KEY);
        const fromGoogle = await SecureStore.getItemAsync("fromGoogle");
        setFromGoogle(fromGoogle ? fromGoogle : "false");
        setSavedData(savedData ? savedData : "");

        if (fromGoogle === "true") {
          if (savedData) {
            const parsed = JSON.parse(savedData);
            setFirstName(parsed.firstName || "");
            setLastName(parsed.lastName || "");
            setFirebaseToken(parsed.token || "");
          }
        } else {
          if (savedData) {
            const parsed = JSON.parse(savedData);
            setFirstName(parsed.firstName || "");
            setMiddleName(parsed.middleName || "");
            setLastName(parsed.lastName || "");
            setSuffix(parsed.suffix || "");
            setBlock(parsed.block || "");
            setStreet(parsed.street || "");
            setBarangay(parsed.barangay || "");
            setCity(parsed.city || "");
          }
        }
      } catch (err) {
        console.error("Error loading saved user info:", err);
      }
    })();
  }, []);

  useEffect(() => {
    const saveUserInfo = async () => {
      try {
        const dataToSave = {
          firstName,
          middleName,
          lastName,
          suffix,
          block,
          street,
          barangay,
          city,
        };
        await SecureStore.setItemAsync(
          USER_INFO_STORAGE_KEY,
          JSON.stringify(dataToSave)
        );
      } catch (err) {
        console.error("Error saving user info:", err);
      }
    };
    saveUserInfo();
  }, [firstName, middleName, lastName, suffix, block, street, barangay, city]);

  const handleFirstNameChange = (text: string) => {
    setFirstName(cleanNameInput(text));
  };

  const handleMiddleNameChange = (text: string) => {
    setMiddleName(cleanNameInput(text));
  };

  const handleLastNameChange = (text: string) => {
    setLastName(cleanNameInput(text).replace(/\./g, ""));
  };

  const handleSuffixChange = (text: string) => {
    setSuffix(cleanAlphaInput(text));
  };

  const handleBlockChange = (text: string) => {
    setBlock(cleanAlphanumericInput(text));
  };

  const handleStreetChange = (text: string) => {
    setStreet(cleanAlphanumericInput(text));
  };

  const handleBarangayChange = (text: string) => {
    setBarangay(cleanAlphanumericInput(text));
  };

  const handleCityChange = (text: string) => {
    setCity(cleanAlphanumericInput(text));
  };

  const handleSubmitUserInfo = async () => {
    setLoading(true);
    try {
      const savedData = await SecureStore.getItemAsync(USER_INFO_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFirstName(parsed.firstName || "");
        setMiddleName(parsed.middleName || "");
        setLastName(parsed.lastName || "");
        setSuffix(parsed.suffix || "");
        setBlock(parsed.block || "");
        setStreet(parsed.street || "");
        setBarangay(parsed.barangay || "");
        setCity(parsed.city || "");
      }

      let tokenToUse = firebaseToken;

      if (fromGoogle === "false") {
        const verifiedEmail = await SecureStore.getItemAsync("verified_email");
        const verifiedPassword = await SecureStore.getItemAsync(
          "signup_confirm_password"
        );

        if (!verifiedEmail || !verifiedPassword) {
          Alert.alert("Error", "Missing credentials");
          setLoading(false);
          return;
        }

        const { token } = await signUp(verifiedEmail, verifiedPassword);
        tokenToUse = token;
      } else {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert("Error", "Not signed in with Google.");
          setLoading(false);
          return;
        }
        tokenToUse = await currentUser.getIdToken(true);
      }

      setFirebaseToken(tokenToUse);

      const userDetails = {
        firstName,
        middleName,
        lastName,
        suffix,
        block,
        street,
        barangay,
        city,
      };

      const response = await fetch(
        `http://${LOCAL_IP}:${PORT}/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenToUse}`,
          },
          body: JSON.stringify(userDetails),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        Alert.alert("Error", result.message);
        setLoading(false);
        return;
      }

      if (response.ok) {
        console.log("User created successfully:", result);

        await SecureStore.deleteItemAsync(USER_INFO_STORAGE_KEY);
        await SecureStore.deleteItemAsync(SSO_INFO_STORAGE_KEY);
        await SecureStore.deleteItemAsync("signup_email");
        await SecureStore.deleteItemAsync("verified_email");
        await SecureStore.deleteItemAsync("signup_password");
        await SecureStore.deleteItemAsync("signup_confirm_password");
        await SecureStore.deleteItemAsync("firebaseToken");
        await SecureStore.deleteItemAsync("fromGoogle");
        Alert.alert("Success", "User profile saved!");

        console.log("createUserInfo" + email);

        router.replace({
          pathname: "/(tabs)/(home)"
        });
      } else {
        console.error("Error:", result.message);
        return Alert.alert("Error", "Registration failed");
      }
    } catch (error) {
      console.error("Error submitting user info:", error);
      Alert.alert("Error", "Failed to submit user info.");
    } finally {
      setLoading(false);
    }
  };

  const checkIfFirstNameHasValue = firstName.trim().length > 0;
  const checkIfLastNameHasValue = lastName.trim().length > 0;
  const checkIfAddressHasValue =
    block.trim().length > 0 &&
    street.trim().length > 0 &&
    barangay.trim().length > 0 &&
    city.trim().length > 0;

  const areAllFieldsFilled =
    checkIfFirstNameHasValue &&
    checkIfLastNameHasValue &&
    checkIfAddressHasValue;

  return {
    firstName,
    middleName,
    lastName,
    suffix,
    block,
    street,
    barangay,
    city,
    fromGoogle,
    loading,
    areAllFieldsFilled,
    handleFirstNameChange,
    handleMiddleNameChange,
    handleLastNameChange,
    handleSuffixChange,
    handleBlockChange,
    handleStreetChange,
    handleBarangayChange,
    handleCityChange,
    handleSubmitUserInfo,
  };
};
