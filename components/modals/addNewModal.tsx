import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { NavigationService, ROUTES } from "@/utils/navigationUtils";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Text, View } from "react-native";
import { typography } from "../../assets/fonts/Text";
import PlantIcon from "../../assets/images/icons/plant(Add).svg";
import RackIcon from "../../assets/images/icons/rack(Add).svg";

interface AddNewModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface OptionButtonProps {
  label: string;
  onPress: () => void | Promise<void>;
}

const getIconByLabel = (label: string) => {
  if (label === "Plant") return PlantIcon;
  if (label === "Rack") return RackIcon;
  return null;
};

const OptionButton: React.FC<OptionButtonProps> = ({ label, onPress }) => {
  const [isLoading, setIsLoading] = useState(false);
  const Icon = getIconByLabel(label);

  const handlePress = async () => {
    if (isLoading) return;
    setIsLoading(true);

    await onPress();

    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <DebouncedTouchableOpacity
      className={`items-center mb-5 ${isLoading ? "opacity-50" : ""}`}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <View className="w-20 h-20 bg-[#E5EDCF] rounded-2xl justify-center items-center mb-3">
        {Icon && <Icon width={21} height={21} />}
      </View>
      <Text style={typography["subheader"]} className="text-[#86975A]">
        {label}
      </Text>
    </DebouncedTouchableOpacity>
  );
};

export const AddNewModal: React.FC<AddNewModalProps> = ({
  isVisible,
  onClose,
}) => {
  const router = useRouter();
  const navService = new NavigationService(router);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%"], []);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  /**
   * Handle navigation with proper cleanup
   * Closes sheet and modal, then navigates after a brief delay
   */
  const handleNavigation = useCallback(
    (pathname: string) => {
      bottomSheetRef.current?.close();
      onClose();
      // Small delay to ensure modal is closed before navigation
      setTimeout(() => {
        navService.push(pathname);
      }, 100);
    },
    [onClose, navService],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: "#FAFAFA",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#D1D5DB",
        width: 40,
        height: 4,
      }}
    >
      <BottomSheetView className="flex-1 px-6 pt-4 pb-10 items-center">
        <Text
          style={typography["h2-bold"]}
          className="text-[#86975A] mb-8 text-center"
        >
          Add to your Nurtura Farm
        </Text>

        <View className="flex-row gap-6 justify-center w-full">
          <OptionButton
            label="Plant"
            onPress={() => handleNavigation(ROUTES.TABS.ADD.PLANT.STEP_1)}
          />
          <OptionButton
            label="Rack"
            onPress={() => handleNavigation(ROUTES.TABS.ADD.RACK.STEP_1)}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};
