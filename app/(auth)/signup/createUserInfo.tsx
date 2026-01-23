import { PrimaryButton } from "@/components/shared/primaryButton";
import { TextInputField } from "@/components/shared/textInputField";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/firebase";
import useFetch from "@/hooks/useFetch";
import { cleanAlphaInput, cleanAlphanumericInput, cleanNameInput } from "@/utils/validation";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { getFirebaseIdToken } from "@/lib/firebaseAuth";
import { authService } from "@/services/authService";

const USER_INFO_STORAGE_KEY = "temp_user_info";
const SSO_INFO_STORAGE_KEY = "sso_temp_user_info";

const CLEAR_STORAGE_KEYS = [
  USER_INFO_STORAGE_KEY,
  SSO_INFO_STORAGE_KEY,
  "signup_email",
  "verified_email",
  "signup_password",
  "signup_confirm_password",
  "firebaseToken",
  "fromGoogle",
];

const clearAllSecureStore = async () => {
  await Promise.all(
    CLEAR_STORAGE_KEYS.map((key) => SecureStore.deleteItemAsync(key))
  );
};

const CreateUserInfo = () => {
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

  const { signUp } = useAuth();

  const router = useRouter();

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

  const {
    refetch: createAccount
  } = useFetch('/api/users', {
    method: 'POST',
    autoFetch: false,
    withAuth: true
  });

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

      console.log("Creating account with details:", userDetails);

      // const response = await createAccount({
      //   body: { ...userDetails }
      // });

      // if (response.error) {
      //   console.error("Error creating account:", response.error);
      //   Alert.alert("Error", "Failed to create account.");
      //   setLoading(false);
      //   return;
      // }

      const response = await authService.createAccount(createAccount, userDetails);

      if (!response.success) {
        console.error("Error creating account:", response.message);
        Alert.alert("Error", "Failed to create account.");
        setLoading(false);
        return;
      }

      console.log("User info submitted successfully.");
      await clearAllSecureStore();
      router.replace("/(tabs)/(home)");
      
    } catch (error) {
      console.error("Error submitting user info:", error);
      Alert.alert("Error", "Failed to submit user info.");
    } finally {
      setLoading(false);
    }
  };
  
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
  
  useEffect(() => {
    (async () => {
      try {
        const fromGoogleFlag = await SecureStore.getItemAsync("fromGoogle");
        const isFromGoogle = fromGoogleFlag === "true";

        setFromGoogle(isFromGoogle ? "true" : "false");

        const storageKey = isFromGoogle ? SSO_INFO_STORAGE_KEY : USER_INFO_STORAGE_KEY;
        const savedData = await SecureStore.getItemAsync(storageKey);

        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (isFromGoogle) {
            setFirstName(parsed.firstName || "");
            setLastName(parsed.lastName || "");
            setFirebaseToken(parsed.token || "");
          } else {
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

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 34 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-black font-bold text-3xl mb-3 pl-2">
          Let us know you!
        </Text>

        <Text className="text-base text-gray-700 mb-6 pl-2 leading-normal">
          {fromGoogle === "true"
            ? "We've pre-filled your info from Google. Please complete the missing fields."
            : "Fill in your information to complete your registration."}
        </Text>
 
        <View className="mb-2">
          <Text className="text-gray-700 text-base font-semibold tracking-wide mb-3 pl-2">
            Personal Information
          </Text>

          <TextInputField
            label="First Name"
            value={firstName}
            onChangeText={handleFirstNameChange}
          />

          <TextInputField
            label="Middle Name (optional)"
            value={middleName}
            onChangeText={handleMiddleNameChange}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextInputField
                label="Last Name"
                value={lastName}
                onChangeText={handleLastNameChange}
              />
            </View>
            <View className="w-[100px]">
              <TextInputField
                label="Suffix"
                value={suffix}
                onChangeText={handleSuffixChange}
              />
            </View>
          </View>
        </View>
 
        <View className="mb-6">
          <Text className="text-gray-500 text-base font-semibold uppercase tracking-wide mb-3 pl-2">
            Address
          </Text>

          <View className="flex-row gap-3 mb-1">
            <View className="w-[100px]">
              <TextInputField
                label="Block/No."
                value={block}
                onChangeText={handleBlockChange}
              />
            </View>
            <View className="flex-1">
              <TextInputField
                label="Street"
                value={street}
                onChangeText={handleStreetChange}
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextInputField
                label="Barangay"
                value={barangay}
                onChangeText={handleBarangayChange}
              />
            </View>
            <View className="flex-1">
              <TextInputField
                label="City"
                value={city}
                onChangeText={handleCityChange}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-4 pb-8 pt-4 bg-white border-t border-gray-100">
        <PrimaryButton
          onPress={handleSubmitUserInfo}
          loading={loading}
          disabled={!areAllFieldsFilled}
          title="Finish"
        />
      </View>
    </View>
  );
};

export default CreateUserInfo;
