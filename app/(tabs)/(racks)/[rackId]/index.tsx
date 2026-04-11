import { typography } from "@/assets/fonts/Text";
import PlantCareIcon from "@/assets/images/icons/plantCare(Activity).svg";
import PlantIcon from "@/assets/images/icons/plants(Dashboard).svg";
import { HarvestModal } from "@/components/modals/harvestModal";
import { OnboardingTutorialModal } from "@/components/onboarding/tutorialModal"; // Added
import PlantStatusIndicators from "@/components/racks/plantStatusIndicators";
import { PlantStatusIndicatorsSkeleton } from "@/components/racks/skeleton/plantStatusIndicatorsSkeleton";
import { BottomButton } from "@/components/shared/bottomButton";
import { DebouncedTouchableOpacity } from "@/components/shared/debouncedTouchable";
import { MenuCard } from "@/components/shared/menubtn";
import { MenuCardSkeleton } from "@/components/shared/skeleton/menuCardSkeleton";
import { SmallDescriptionSkeleton } from "@/components/shared/skeleton/smallDescriptionSkeleton";
import SmallDescription from "@/components/shared/smallDescription";
import useFetch from "@/hooks/useFetch";
import { useRackSensor } from "@/hooks/useRackSensor";
import { rackService } from "@/services/rackService";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router"; // Added Stack
import React, { useCallback, useState } from "react";
import { Alert, Dimensions, Image, ScrollView, Text, View } from "react-native";
import DateIcon from "../../../../assets/images/icons/date.svg";
import SoilIcon from "../../../../assets/images/icons/soil.svg";
import { PLANT_IMAGES } from "../../../../utils/constants";

const screenHeight = Dimensions.get("window").height;

const formatLabel = (value: string) =>
  value
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const RackInfo = () => {
  const { rackId } = useLocalSearchParams<{ rackId: string }>();
  const [showModal, setShowModal] = useState(false);
  const [activePlant, setActivePlant] = useState<any>(null);
  const [rackName, setRackName] = useState<string>("Unknown Rack");
  const [loading, setLoading] = useState(true);
  const [harvesting, setHarvesting] = useState(false);

  // ── Tutorial Logic ────────────────────────────────────────────────────────
  const [tutorialStep, setTutorialStep] = useState(1);
  const TOTAL_STEPS = 2;

  const handleNextStep = () => {
    setTutorialStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : 0));
  };

  const getTutorialContent = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: "Edit Your Nurtura Rack",
          desc: "Give your plants a little attention — adjust their info, care schedule, or environment setup.",
          image: require("@/assets/nuri/pointing-up.png"),
          position: { top: 250, right: -50 },
          offset: 50,
          component: (
            <View className="items-center justify-center">
              <View className="bg-white p-4 rounded-[20px] items-center justify-center shadow-sm w-[72px] h-[72px]">
                <Image
                  source={require("@/assets/images/racks/edit.png")}
                  style={{ width: 22, height: 22 }}
                  resizeMode="contain"
                />
              </View>
            </View>
          ),
        };
      case 2:
        return {
          title: "Add a Plant",
          desc: "Register a new plant to connect it with real-time sensors, automated care, and smart tracking.",
          image: require("@/assets/nuri/thinking.png"),
          position: { bottom: 0, right: -50 },
          offset: screenHeight - 580,
          component: (
            <View className="px-8 w-full items-center">
              <View className="bg-[#EDEDED] rounded-xl px-12 py-6 w-full items-center">
                <Text style={typography["button-bold"]} className="text-black">
                  Add a Plant
                </Text>
              </View>
            </View>
          ),
        };
      default:
        return null;
    }
  };

  const currentTutorial = getTutorialContent(tutorialStep);

  const { reading } = useRackSensor(rackId);

  const { refetch: getRackInfo } = useFetch(`/racks/${rackId}`, {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: refetchHarvest } = useFetch(`/racks/${rackId}/harvest`, {
    method: "POST",
    autoFetch: false,
    withAuth: true,
  });

  const { refetch: refetchHarvestLeaves } = useFetch(
    `/racks/${rackId}/harvest-leaves`,
    { method: "POST", autoFetch: false, withAuth: true },
  );

  const { refetch: refetchHarvestSeeds } = useFetch(
    `/racks/${rackId}/harvest-seeds`,
    { method: "POST", autoFetch: false, withAuth: true },
  );

  const applyRackData = useCallback((rack: any) => {
    if (rack.name) setRackName(rack.name);
    if (rack.currentPlant) {
      setActivePlant({
        quantity: rack.quantity ?? 0,
        plantedAt: rack.plantedAt ?? null,
        plant: {
          id: rack.currentPlantId,
          name: rack.currentPlant.name,
          type: rack.currentPlant.category,
          recommendedSoil: rack.currentPlant.recommendedSoil,
        },
      });
    } else {
      setActivePlant({
        quantity: rack.quantity ?? 0,
        plantedAt: rack.plantedAt ?? null,
        plant: null,
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchRackData = async () => {
        try {
          if (isActive) setLoading(true);
          const rackResponse = await rackService.getRackbyId(getRackInfo);
          if (!isActive) return;
          const rack = rackResponse?.rack;
          if (rack) applyRackData(rack);
        } catch (err) {
          console.error("Failed to fetch rack data:", err);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      if (rackId) fetchRackData();
      return () => {
        isActive = false;
      };
    }, [rackId]),
  );

  const handleHarvestConfirm = useCallback(
    async (selectedKey: number, seedQuantity: number) => {
      const plantId = activePlant?.plant?.id;
      if (!plantId) return;

      setShowModal(false);
      setHarvesting(true);

      try {
        if (selectedKey === 1) {
          await rackService.harvestLeaves(refetchHarvestLeaves, { plantId });
        } else if (selectedKey === 2) {
          await rackService.harvestPlant(refetchHarvest, { plantId });
        } else if (selectedKey === 3) {
          await rackService.harvestSeeds(refetchHarvestSeeds, {
            plantId,
            quantity: seedQuantity,
          });
        }

        const rackResponse = await rackService.getRackbyId(getRackInfo);
        const rack = rackResponse?.rack;
        if (rack) applyRackData(rack);

        router.push({
          pathname: `/(tabs)/(racks)/${rackId}/success-screen` as any,
          params: {
            title: "Harvest Recorded!",
            subtitle: "Your harvest has been successfully recorded.",
          },
        });
      } catch (err) {
        console.error("Harvest failed:", err);
        Alert.alert("Error", "Failed to record harvest. Please try again.");
      } finally {
        setHarvesting(false);
      }
    },
    [
      activePlant,
      refetchHarvest,
      refetchHarvestLeaves,
      refetchHarvestSeeds,
      getRackInfo,
      applyRackData,
    ],
  );

  const handleCancel = useCallback(() => setShowModal(false), []);
  const handleHarvestPress = useCallback(() => setShowModal(true), []);

  const plantName = activePlant?.plant?.name?.toLowerCase();
  const imageSource =
    plantName && PLANT_IMAGES[plantName]
      ? PLANT_IMAGES[plantName]
      : PLANT_IMAGES.default;

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!loading && !activePlant?.plant) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-8">
        <Text style={typography["subheader-bold"]} className="text-black mb-2">
          No plant yet!
        </Text>
        <Text
          style={typography["subheader"]}
          className="text-grayText text-center mb-8"
        >
          You haven&apos;t added a plant in your rack yet.
        </Text>
        <DebouncedTouchableOpacity
          onPress={() => {
            console.log("Navigating to step-2 with params:", {
              rackId,
              rackName,
              rackValue: rackId,
            });
            router.push({
              pathname: "/(tabs)/(add_pages)/(addNewPlant)/step-2" as any,
              params: {
                rackId,
                rackName,
                rackValue: rackId,
              },
            });
          }}
          className="bg-[#EDEDED] active:bg-gray-300 rounded-xl px-12 py-6"
        >
          <Text style={typography["button-bold"]} className="text-black">
            Add a Plant
          </Text>
        </DebouncedTouchableOpacity>

        {currentTutorial && (
          <OnboardingTutorialModal
            visible={tutorialStep > 0}
            onClose={handleNextStep}
            title={currentTutorial.title}
            subtitle={currentTutorial.desc}
            topOffset={currentTutorial.offset}
            characterImage={currentTutorial.image}
            characterPosition={currentTutorial.position}
          >
            {currentTutorial.component}
          </OnboardingTutorialModal>
        )}
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 bg-white">
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="bg-white px-4 py-4"
        >
          <View className="flex-1 justify-center items-center">
            <Image
              source={imageSource}
              className="w-72 h-72"
              resizeMode="cover"
            />
          </View>
          {/* Plant name + seed count */}
          {loading ? (
            <View className="w-full flex-row justify-between items-start mb-6 px-2 gap-4">
              <View className="flex-1 gap-2">
                <SkimmerLine width="55%" height={24} />
                <SkimmerLine width="35%" height={14} />
              </View>
              <View className="items-end gap-2">
                <SkimmerLine width={32} height={24} />
                <SkimmerLine width={40} height={14} />
              </View>
            </View>
          ) : (
            <View className="w-full flex-row justify-between items-start mb-6">
              <View className="flex-1 pl-2">
                <Text style={typography["h1-bold"]} className="text-black">
                  {activePlant?.plant?.name ?? "No plant assigned"}
                </Text>
                <Text style={typography["subheader"]} className="text-grayText">
                  {activePlant?.plant?.type
                    ? formatLabel(activePlant.plant.type)
                    : "—"}
                </Text>
              </View>
              <View className="items-end pr-2">
                <Text style={typography["h1-bold"]} className="text-black">
                  {activePlant?.quantity ?? 0}
                </Text>
                <Text style={typography["subheader"]} className="text-grayText">
                  Seeds
                </Text>
              </View>
            </View>
          )}
          {/* Sensor readings — independent sa loading, hintay lang ng reading */}
          <View className="flex-row gap-3 mb-6">
            {reading === null ? (
              <>
                <PlantStatusIndicatorsSkeleton />
                <PlantStatusIndicatorsSkeleton />
                <PlantStatusIndicatorsSkeleton />
              </>
            ) : (
              <>
                <PlantStatusIndicators
                  type="temperature"
                  value={reading.temperature}
                />
                <PlantStatusIndicators
                  type="humidity"
                  value={reading.humidity}
                />
                <PlantStatusIndicators
                  type="soil-moisture"
                  value={reading.moisture}
                />
              </>
            )}
          </View>
          {/* Date planted + recommended soil */}
          <View className="flex-col gap-8 mt-6 mb-8 pl-2">
            {loading ? (
              <>
                <SmallDescriptionSkeleton />
                <SmallDescriptionSkeleton />
              </>
            ) : (
              <>
                <SmallDescription
                  label="Date Planted"
                  value={
                    activePlant?.plantedAt
                      ? formatDate(activePlant.plantedAt)
                      : "—"
                  }
                  Icon={DateIcon}
                />
                <SmallDescription
                  label="Recommended Soil"
                  value={
                    activePlant?.plant?.recommendedSoil
                      ? formatLabel(activePlant.plant.recommendedSoil)
                      : "—"
                  }
                  Icon={SoilIcon}
                />
              </>
            )}
          </View>
          {/* Menu cards */}
          {loading ? (
            <View className="flex-col gap-3 mb-8">
              <MenuCardSkeleton />
              <MenuCardSkeleton />
            </View>
          ) : (
            <View className="flex-col gap-3 mb-8">
              <MenuCard
                title="Plant Care Activity"
                description="Logs based on watering and grow light activity."
                icon={PlantCareIcon}
                iconSize={25}
                onPress={() =>
                  router.push({
                    pathname: `/(tabs)/(racks)/${rackId}/care` as any,
                    params: { rackName },
                  })
                }
              />
              <MenuCard
                title="Harvest Activity"
                description="Records of your past harvests for this plant."
                icon={PlantIcon}
                onPress={() =>
                  router.push({
                    pathname:
                      `/(tabs)/(racks)/${rackId}/harvest-history` as any,
                    params: {
                      rackName,
                      plantId: activePlant?.plant?.id ?? "",
                    },
                  })
                }
              />
            </View>
          )}
        </ScrollView>

        <BottomButton
          title={harvesting ? "Harvesting..." : "Harvest Plant"}
          onPress={handleHarvestPress}
          disabled={harvesting || loading || !activePlant?.plant}
        />
      </View>

      <HarvestModal
        currentSeeds={activePlant?.quantity ?? 0}
        isVisible={showModal}
        title="Harvest Plant"
        onCancel={handleCancel}
        onConfirm={handleHarvestConfirm}
      />
    </>
  );
};

const SkimmerLine = ({
  width,
  height,
}: {
  width: number | string;
  height: number;
}) => (
  <View
    style={{
      width: width as any,
      height,
      borderRadius: 6,
      backgroundColor: "#e0e0e0",
    }}
  />
);

export default RackInfo;
