/* eslint-disable react/no-unescaped-entities */
import useFetch from '@/hooks/useFetch';
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from "react-native";

const ForgotPassword2 = () => {
  const { email } = useLocalSearchParams();
  
  const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputs = useRef<(TextInput | null)[]>([]);

  const allFilled = otp.every((digit) => digit !== "");

  const { 
    refetch: sendOtp 
  } = useFetch('/api/auth/otp/forgot-password', {
    method: 'POST',
    autoFetch: false,
    withAuth: false
  });

  const { 
    refetch: verifyOtp 
  } = useFetch('/api/auth/otp/verify', {
    method: 'POST',
    autoFetch: false,
    withAuth: false
  });

  const handleSendOtp = useCallback(async (isResend = false) => {
    if (!email) return;

    setLoading(true);
    try {
      const response = await sendOtp({ body: { email } });

      if (response.error) {
        Alert.alert("Error", response.error.message || "Failed to send OTP.");
      } else {
        if (isResend) {
          Alert.alert("Success", "OTP has been resent to your email.");
          setTimer(60); 
        }
      }
    } catch (err: any) {
        Alert.alert("Error", err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [email, sendOtp]);

  const handleChange = (text: string, index: number) => { 
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (isOtpInvalid) {
      setIsOtpInvalid(false);
    }

    if (text && index < 4) {
      inputs.current[index + 1]?.focus();
    }
    
    const filled = newOtp.every((digit) => digit !== "");
    if (filled) {
      const userCode = newOtp.join("");
      submitOtp(userCode);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleFocus = (index: number) => {
    const firstEmptyIndex = otp.findIndex((v) => v === "");
    
    if (firstEmptyIndex !== -1 && index > firstEmptyIndex) {
      inputs.current[firstEmptyIndex]?.focus();
    }
  };

  const submitOtp = async (userCode: string) => {
    setLoading(true);
    setIsOtpInvalid(false);

    try {
      console.log("Verifying OTP for:", email, "Code:", userCode);
      
      const response = await verifyOtp({
        body: { email, code: userCode, purpose: "forgot-password" }
      });

      if (response.error) {
        setIsOtpInvalid(true);
        Alert.alert("Invalid OTP", response.error.message || "The OTP is incorrect.");
        setLoading(false); 
        return;
      }

      console.log("OTP verified successfully. Navigating...");
      await SecureStore.setItemAsync("forgot_password_verified_email", email as string);
      
      router.push({
        pathname: "/(auth)/forgetpassword/forgotPassword3",
        params: { email },
      });

    } catch (error) {
      console.error("Error verifying OTP:", error);
      Alert.alert("Error", "Failed to verify OTP. Please try again.");
      setLoading(false); 
    }
  };

  const handleResendPress = () => {
    if (timer > 0 || loading) return;
    handleSendOtp(true);
  };

  const handleNextPress = () => {
    const userCode = otp.join("");
    submitOtp(userCode);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);


  useEffect(() => {
    handleSendOtp(false);
  }, []); 

  return (
    <View className="flex-1 bg-white px-[16px] pb-[34px] w-screen justify-between h-screen">
      <View className="mt-[34px] flex-1 items-start">
        <Text className="text-black font-bold text-3xl pl-2 mb-[13px]">
          Enter one-time code
        </Text>

        <Text className="pl-2 mb-[20px] text-base text-gray-700 leading-normal">
          Enter the 5 digit code that was sent to your email address: {""}
          <Text className="text-primary font-bold">{email}</Text>
        </Text>

        <View className="flex-row justify-between w-[100%] self-center mb-[10px]">
          {otp.map((value, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputs.current[index] = ref;
              }}
              value={value}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => handleFocus(index)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!loading} 
              className={`h-[60px] w-[60px] border-[2px] rounded-[12px] text-black text-center text-xl font-bold ${
                isOtpInvalid ? "border-[#E65656]" : "border-grayText"
              }`}
              returnKeyType="next"
            />
          ))}
        </View>
        
        {isOtpInvalid && (
          <Text className="text-[#E65656] text-base mb-[26px] pl-2">
            Invalid OTP. Please try again.
          </Text>
        )}

        <View className="self-start pl-2 mb-[26px] flex-row items-center">
          <Text className="text-base text-gray-700 leading-normal">
            Didn't receive the code?{" "}
          </Text>
          <TouchableOpacity 
            onPress={handleResendPress} 
            disabled={timer > 0 || loading}
          >
            <Text
              className={`text-base font-semibold underline ${
                timer > 0 || loading ? "text-gray-400" : "text-primary"
              }`}
            >
              {loading && timer === 0 ? "Sending..." : "Resend code"}
            </Text>
          </TouchableOpacity>

          {timer > 0 && (
            <Text className="ml-2 text-base text-gray-500">({timer}s)</Text>
          )}
        </View>
      </View>

      <View className="w-full">
        <TouchableOpacity
          onPress={handleNextPress}
          className={`w-full p-6 rounded-[12px] mt-2 flex items-center ${
            allFilled && !loading ? "bg-primary" : "bg-[#919191]"
          }`}
          disabled={!allFilled || loading}
        >
          <Text className="text-white text-xl font-bold">
            {loading ? "Loading..." : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForgotPassword2;