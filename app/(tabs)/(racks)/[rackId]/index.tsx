import { typography } from "@/assets/fonts/Text";
import PlantCareIcon from "@/assets/images/icons/plantCare(Activity).svg";
import PlantIcon from "@/assets/images/icons/plants(Dashboard).svg";
import { HarvestModal } from "@/components/modals/harvestModal";
import PlantStatusIndicators from "@/components/racks/plantStatusIndicators";
import { PlantStatusIndicatorsSkeleton } from "@/components/racks/skeleton/plantStatusIndicatorsSkeleton";
import { BottomButton } from "@/components/shared/bottomButton";
import { MenuCard } from "@/components/shared/menubtn";
import { MenuCardSkeleton } from "@/components/shared/skeleton/menuCardSkeleton";
import { SmallDescriptionSkeleton } from "@/components/shared/skeleton/smallDescriptionSkeleton";
import SmallDescription from "@/components/shared/smallDescription";
import useFetch from "@/hooks/useFetch";
import { useRackSensor } from "@/hooks/useRackSensor";
import { rackService } from "@/services/rackService";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import DateIcon from "../../../../assets/images/icons/date.svg";
import SoilIcon from "../../../../assets/images/icons/soil.svg";
import { PLANT_IMAGES } from "../../../../utils/constants";

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
  const [loading, setLoading] = useState(true);
  const [harvesting, setHarvesting] = useState(false);

  const { reading } = useRackSensor(rackId);

  // ── Rack fetch ─────────────────────────────────────────────────────────────
  const { refetch: getRackInfo } = useFetch(`/racks/${rackId}`, {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  // ── Harvest endpoints (per API docs) ──────────────────────────────────────
  // key 2 → POST /racks/{rackId}/harvest        (Harvest All)
  // key 1 → POST /racks/{rackId}/harvest-leaves (Harvest Leaves only)
  // key 3 → POST /racks/{rackId}/harvest-seeds  (Take Some Seeds)
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

  // ── Shared rack state setter ───────────────────────────────────────────────
  const applyRackData = useCallback((rack: any) => {
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

  // ── Load rack data on focus ────────────────────────────────────────────────
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

  // ── Harvest confirm ────────────────────────────────────────────────────────
  const handleHarvestConfirm = useCallback(
    async (selectedKey: number, seedQuantity: number) => {
      const plantId = activePlant?.plant?.id;
      if (!plantId) return;

      setShowModal(false);
      setHarvesting(true);

      try {
        if (selectedKey === 1) {
          // Harvest Leaves only
          await rackService.harvestLeaves(refetchHarvestLeaves, { plantId });
        } else if (selectedKey === 2) {
          // Harvest All
          await rackService.harvestPlant(refetchHarvest, { plantId });
        } else if (selectedKey === 3) {
          // Take Some Seeds
          await rackService.harvestSeeds(refetchHarvestSeeds, {
            plantId,
            quantity: seedQuantity,
          });
        }

        Alert.alert("Success", "Harvest recorded successfully.");

        // Refresh rack state after harvest
        const rackResponse = await rackService.getRackbyId(getRackInfo);
        const rack = rackResponse?.rack;
        if (rack) applyRackData(rack);
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

  return (
    <>
      <View className="flex-1 bg-white">
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="bg-white px-4 py-4"
        >
          <View className="flex-1 justify-center items-center pl-8">
            <Image
              source={imageSource}
              className="w-72 h-72"
              resizeMode="contain"
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

          {/* Sensor readings */}
          <View className="flex-row gap-3 mb-6">
            {loading || reading === null ? (
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
          <View className="flex-col gap-3 mb-8">
            {loading ? (
              <>
                <MenuCardSkeleton />
                <MenuCardSkeleton />
              </>
            ) : (
              <>
                <MenuCard
                  title="Plant Care Activity"
                  description="Logs based on watering and grow light activity."
                  icon={PlantCareIcon}
                  iconSize={25}
                  route="/(tabs)/(racks)/care"
                />
                <MenuCard
                  title="Harvest Activity"
                  description="Records of your past harvests for this plant."
                  icon={PlantIcon}
                  route="/(tabs)/(racks)/harvest-history"
                />
              </>
            )}
          </View>
        </ScrollView>

        <BottomButton
          title={harvesting ? "Harvesting..." : "Mark as Harvested"}
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
