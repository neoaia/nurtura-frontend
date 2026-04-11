import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { useRef } from "react";
import { Modal, ScrollView, Text, View } from "react-native";

interface ConsentModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  type: "TS" | "PP" | null;
  hasScrolledToEnd: boolean;
  onScrollEnd: () => void;
}

export const ConsentModal = ({
  visible,
  onClose,
  onAccept,
  type,
  hasScrolledToEnd,
  onScrollEnd,
}: ConsentModalProps) => {
  const scrollViewRef = useRef<{ layoutHeight?: number }>({});

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-5 w-full max-w-[380px] max-h-[85%]">
          <Text className="text-[18px] font-bold text-center mb-3 text-black">
            {type === "TS" ? "Terms and Conditions" : "Privacy Policy"}
          </Text>

          <ScrollView
            className="border border-gray-200 rounded-xl p-3 mb-4"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              scrollViewRef.current.layoutHeight = height;
            }}
            onContentSizeChange={(contentWidth, contentHeight) => {
              if (
                scrollViewRef.current.layoutHeight &&
                contentHeight <= scrollViewRef.current.layoutHeight + 10
              ) {
                onScrollEnd();
              }
            }}
            onScroll={(event) => {
              const { contentOffset, layoutMeasurement, contentSize } =
                event.nativeEvent;
              const isEndReached =
                contentOffset.y + layoutMeasurement.height >=
                contentSize.height - 20;
              if (isEndReached) onScrollEnd();
            }}
            scrollEventThrottle={16}
          >
            {type === "TS" ? (
              <>
                <Text className="text-black font-bold text-[18px] mb-2">
                  Overview
                </Text>

                <Text className="text-gray-700 text-base leading-loose mb-4">
                  Welcome to Nurtura, an IoT-based smart urban farming system
                  that helps users monitor and automate plant care in real time.
                  These Terms and Conditions govern your use of the Nurtura
                  mobile application, related software, and connected services.
                  By creating an account, downloading, or using Nurtura, you
                  agree to these Terms. Please read them carefully, as they
                  outline your rights, responsibilities, and the limits of our
                  liability. If you do not agree to these Terms, you must not
                  use our Service.
                </Text>

                <Text className="text-black font-bold text-[18px] mb-2">
                  1. Acceptance of Terms
                </Text>
                <Text className="text-gray-700 text-base leading-loose mb-4">
                  By accessing or using this app, you agree to be legally bound
                  by these Terms and Conditions. If you do not agree, please do
                  not use the app.
                </Text>

                <Text className="text-black font-bold text-[18px] mb-2">
                  2. Use of the App
                </Text>
                <Text className="text-gray-700 text-base leading-loose mb-4">
                  You must be at least 13 years old (or the minimum legal age in
                  your jurisdiction) to use Nurtura. You agree to use Nurtura
                  only for lawful purposes and in accordance with these Terms.
                  You are responsible for maintaining the confidentiality of
                  your account and for all activities that occur under it. We
                  reserve the right to suspend or terminate your access if you
                  violate these Terms or engage in any unauthorized or harmful
                  activities.
                </Text>

                <Text className="text-black font-bold text-[18px] mb-2">
                  3. Account Responsibility
                </Text>
                <Text className="text-gray-700 text-base leading-loose mb-4">
                  You are responsible for maintaining the confidentiality of
                  your account credentials and for all activities that occur
                  under your account.
                </Text>

                <Text className="text-gray-700 text-base leading-loose mb-4">
                  When you register, you agree to provide accurate and complete
                  information. You must not share your account credentials or
                  allow others to access your account. You may deactivate or
                  delete your account at any time through the app’s settings or
                  by contacting our support team.
                </Text>

                <Text className="text-black font-bold text-[18px] mb-2">
                  4. Intellectual Property
                </Text>

                <Text className="text-gray-700 text-base leading-loose mb-4">
                  All content, software, trademarks, designs, and related
                  materials in Nurtura are owned by the Nurtura Development Team
                  or its licensors. You are granted a limited, non-exclusive,
                  and revocable license to use the app for personal,
                  non-commercial purposes. You may not copy, modify, distribute,
                  reverse-engineer, or create derivative works from any part of
                  the Service without our written consent.
                </Text>

                <Text className="text-black font-bold text-[18px] mb-2">
                  5. Software and Updates
                </Text>
                <Text className="text-gray-700 text-base leading-loose mb-4">
                  Nurtura may automatically download and install updates,
                  including security patches or feature improvements. You agree
                  to receive such updates as part of your continued use of the
                  Service. We reserve the right to modify, suspend, or
                  discontinue parts of the Service at any time with or without
                  notice.
                </Text>

                <Text className="text-black font-bold text-[18px] mb-2">
                  6. User Responsibilities
                </Text>
                <Text className="text-gray-700 text-base leading-loose mb-4">
                  You agree not to: Use Nurtura for illegal, harmful, or
                  disruptive purposes; Interfere with the app’s normal operation
                  or security; Attempt to access restricted areas or data not
                  intended for you; Use automated systems (such as bots or
                  scrapers) to interact with the Service; Misrepresent data,
                  plant information, or environmental readings to manipulate
                  system performance.
                </Text>

                <Text className="text-black font-bold text-[18px] mb-2">
                  7. Limitation of Liability
                </Text>
                <Text className="text-gray-700 text-base leading-loose mb-4">
                  To the maximum extent permitted by law, Nurtura and its
                  developers shall not be liable for any indirect, incidental,
                  or consequential damages, including loss of data, plants, or
                  productivity, arising from your use of the Service. You
                  acknowledge that Nurtura’s automation depends on environmental
                  factors beyond our control (e.g., network conditions, sensor
                  performance, water and power supply), and you assume full
                  responsibility for monitoring plant health.
                </Text>
                <Text className="text-black font-bold text-[18px] mb-2">
                  8. Hardware Use
                </Text>

                <Text className="text-gray-700 text-base leading-loose mb-4">
                  To protect proprietary information, details of Nurtura’s
                  hardware components and configurations are confidential. Users
                  may not disassemble, replicate, or modify the connected
                  devices or attempt to reverse-engineer the system’s physical
                  components. Tampering with any hardware or electrical parts
                  voids warranty and support coverage.
                </Text>

                <Text className="text-black font-bold text-[18px] mb-2">
                  9. Warranty
                </Text>

                <Text className="text-gray-700 text-base leading-loose mb-4">
                  Nurtura includes a 7-day replacement warranty covering
                  manufacturing defects only. This warranty does not apply to
                  damages caused by misuse, modification, or improper handling.
                </Text>

                <Text className="text-black font-bold text-[18px] mb-2">
                  10. Support and Training
                </Text>

                <Text className="text-gray-700 text-base leading-loose mb-4">
                  We provide 3 months of free technical support following the
                  first implementation. Support includes troubleshooting,
                  software updates, and basic maintenance assistance.
                  Additionally, 1–2 hours of personal training are included for
                  environment familiarization and actual usage guidance.
                </Text>

                <Text className="text-black font-bold text-[18px] mb-2">
                  11. Changes to Terms
                </Text>
                <Text className="text-gray-700 text-base leading-loose mb-4">
                  We may modify these Terms from time to time to reflect updates
                  in our system, features, or applicable laws. If changes are
                  made, we will notify users through the app or via email before
                  the new Terms take effect. Your continued use of Nurtura after
                  such changes means you accept the updated Terms.
                </Text>

                <Text className="text-black font-bold text-[18px] mb-2">
                  6. Contact Us
                </Text>
                <Text className="text-gray-700 text-base leading-loose mb-10">
                  If you have any questions or concerns about these Terms and
                  Conditions, please contact us through email. We’re happy to
                  assist you and ensure your Nurtura experience remains smooth
                  and productive.
                </Text>

                <Text className="text-gray-500 text-base leading-loose text-center mb-6">
                  By continuing to use Nurtura, you acknowledge that you have
                  read, understood, and agreed to these Terms and Conditions.
                </Text>
              </>
            ) : (
              <>
                <Text className="text-gray-500 text-center text-[12px] mb-6 mt-2">
                  Last updated: October 31, 2025
                </Text>

                <Text className="text-gray-700 text-base leading-loose text-center mb-6">
                  Your privacy is important to us. This Privacy Policy explains
                  how we collect, use, disclose, and safeguard your information
                  when you use our app.
                </Text>

                <View>
                  <Text className="text-black font-bold text-[18px] mb-2">
                    1. Information We Collect
                  </Text>
                  <Text className="text-gray-700 text-base leading-loose mb-4">
                    We may collect personal information such as your name,
                    birthday, email address, and usage data to provide a better
                    experience and improve our services.
                  </Text>
                </View>

                <View>
                  <Text className="text-black font-bold text-[18px] mb-2">
                    2. How We Use Your Information
                  </Text>
                  <Text className="text-gray-700 text-base leading-loose mb-4">
                    The data we collect is used to operate and maintain the app,
                    personalize your experience, send important notifications,
                    and improve system performance.
                  </Text>
                </View>

                <View>
                  <Text className="text-black font-bold text-[18px] mb-2">
                    3. Data Security
                  </Text>
                  <Text className="text-gray-700 text-base leading-loose mb-4">
                    We implement security measures to protect your data, but
                    please be aware that no system is completely secure from
                    potential breaches.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          <View className="flex-row justify-between mt-2">
            <DebouncedTouchableOpacity
              className="flex-1 bg-gray-200 py-3 rounded-xl mr-2"
              onPress={onClose}
            >
              <Text className="text-center text-black font-semibold">
                Decline
              </Text>
            </DebouncedTouchableOpacity>

            <DebouncedTouchableOpacity
              className={`flex-1 py-3 rounded-xl ml-2 ${
                hasScrolledToEnd ? "bg-primary" : "bg-gray-400"
              }`}
              disabled={!hasScrolledToEnd}
              onPress={onAccept}
            >
              <Text className="text-center text-white font-semibold">
                Accept
              </Text>
            </DebouncedTouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
