import { typography } from "@/assets/fonts/Text";
import PlantCard from "@/components/add_plant/plantCard";
import PlantFilterBtn from "@/components/add_plant/plantFilterBtn";
import { BottomButton } from "@/components/shared/bottomButton";
import useFetch from "@/hooks/useFetch";
import { PLANT_IMAGES } from "@/utils/constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  loadAddPlantDraft,
  saveAddPlantDraft,
} from "../../../../utils/addPlantDraft";

interface Plant {
  id: string;
  name: string;
  category: string;
  recommendedSoil: string;
  description: string;
  isActive: boolean;
}

const filterOptions = [
  { id: "all", label: "All Types", value: "all" },
  { id: "LEAFY_GREENS", label: "Leafy Greens", value: "LEAFY_GREENS" },
  { id: "HERBS", label: "Herbs", value: "HERBS" },
  { id: "TROPICAL_GREENS", label: "Tropical Greens", value: "TROPICAL_GREENS" },
  { id: "ROOT_AND_STALK", label: "Root & Stalk", value: "ROOT_AND_STALK" },
];

const formatCategory = (category: string) => {
  return category
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
};

const AddNewPlant2 = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loadingPlants, setLoadingPlants] = useState(false);
  const [draftPlantId, setDraftPlantId] = useState<string | null>(null);

  const { rackId, rackName, rackValue } = useLocalSearchParams<{
    rackId: string;
    rackName: string;
    rackValue: string;
  }>();

  const { refetch: fetchPlants } = useFetch("/plants", {
    method: "GET",
    autoFetch: false,
    withAuth: true,
  });

  const loadPlants = useCallback(async () => {
    setLoadingPlants(true);
    try {
      const result = await fetchPlants();
      console.log("Raw plants result:", JSON.stringify(result, null, 2));

      if (result?.error) {
        console.error("API error:", result.error);
        return;
      }

      const plantList: Plant[] = result?.data?.data ?? [];
      console.log("Plant list length:", plantList.length);
      setPlants(plantList);
    } catch (e) {
      console.error("Fetch exception:", e);
    } finally {
      setLoadingPlants(false);
    }
  }, [fetchPlants]);

  useEffect(() => {
    void loadPlants();
  }, [loadPlants]);

  useEffect(() => {
    let isCancelled = false;

    const loadDraft = async () => {
      if (!rackId) return;

      try {
        const draft = await loadAddPlantDraft(rackId);
        if (isCancelled) return;

        setDraftPlantId(draft?.selectedPlantId ?? null);
      } catch (error) {
        console.warn("Failed to load add plant draft:", error);
      }
    };

    void loadDraft();

    return () => {
      isCancelled = true;
    };
  }, [rackId]);

  useEffect(() => {
    if (!draftPlantId) return;

    const draftPlant = plants.find((plant) => plant.id === draftPlantId);
    if (draftPlant && selectedPlant?.id !== draftPlant.id) {
      setSelectedPlant(draftPlant);
    }
  }, [draftPlantId, plants, selectedPlant?.id]);

  function toProperCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  const handleSelectPlant = useCallback(
    (plant: Plant) => {
      setSelectedPlant(plant);
      setDraftPlantId(plant.id);

      if (rackId) {
        void saveAddPlantDraft(rackId, {
          selectedPlantId: plant.id,
          seedQuantity: 0,
        });
      }
    },
    [rackId],
  );

  const handleNextPress = () => {
    if (!selectedPlant) return;

    if (rackId) {
      void saveAddPlantDraft(rackId, {
        selectedPlantId: selectedPlant.id,
        seedQuantity: 0,
      });
    }

    router.push({
      pathname: "/(tabs)/(add_pages)/(addNewPlant)/step-3",
      params: {
        rackId,
        rackName,
        rackValue,
        plantId: selectedPlant.id,
        plantName: selectedPlant.name,
        plantCategory: formatCategory(selectedPlant.category),
        plantType: selectedPlant.category,
        recommendedSoil: selectedPlant.recommendedSoil,
      },
    });
    console.log("Navigating to step-2 with params:", {
      rackId,
      rackName,
      rackValue: rackId,
      plantId: selectedPlant.id,
      plantName: selectedPlant.name,
      plantCategory: formatCategory(selectedPlant.category),
      plantType: selectedPlant.category,
      recommendedSoil: toProperCase(selectedPlant.recommendedSoil),
    });
  };

  const filteredPlants =
    selectedFilter === "all"
      ? plants
      : plants.filter((plant) => plant.category === selectedFilter);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView
        className="flex-1 p-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mt-4 mb-2">
          Choose your Plant
        </Text>
        <Text style={typography["subheader"]} className="mb-6">
          Choose a plant to add to your{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            Nurtura Rack
          </Text>
          .
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          className="mb-6"
        >
          {filterOptions.map((filter) => (
            <PlantFilterBtn
              key={filter.id}
              title={filter.label}
              onPress={() => setSelectedFilter(filter.value)}
              isActive={selectedFilter === filter.value}
            />
          ))}
        </ScrollView>

        {loadingPlants ? (
          <ActivityIndicator color="#10b981" className="mt-4" />
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {filteredPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plantName={plant.name}
                category={formatCategory(plant.category)}
                image={
                  PLANT_IMAGES[plant.name.toLowerCase()] ?? PLANT_IMAGES.default
                }
                onPress={() => handleSelectPlant(plant)}
                isSelected={selectedPlant?.id === plant.id}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomButton
        title="Next"
        onPress={handleNextPress}
        disabled={!selectedPlant || loadingPlants}
      />
    </SafeAreaView>
  );
};

export default AddNewPlant2;
