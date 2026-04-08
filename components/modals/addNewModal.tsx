import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
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

  const handleNavigation = useCallback(
    (route: string) => {
      bottomSheetRef.current?.close();
      onClose();
      setTimeout(() => {
        router.push(route as any);
      }, 100);
    },
    [onClose],
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
          style={typography["button-bold"]}
          className="text-[#86975A] mb-8 text-center"
        >
          Add to your Nurtura Farm
        </Text>

        <View className="flex-row gap-6 justify-center w-full">
          <OptionButton
            label="Plant"
            onPress={() =>
              handleNavigation("/(add_pages)/(addNewPlant)/step-1")
            }
          />
          <OptionButton
            label="Rack"
            onPress={() => handleNavigation("/(add_pages)/(addNewRack)/step-1")}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};
