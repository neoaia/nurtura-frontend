import { typography } from "@/assets/fonts/Text";
import PlantCard from "@/components/add_plant/plantCard";
import PlantFilterBtn from "@/components/add_plant/plantFilterBtn";
import { ConfirmationModal } from "@/components/modals/confirmationModal";
import { BottomButton } from "@/components/shared/bottomButton";
import { useBackWarning } from "@/hooks/shared/useBackWarning";
import useFetch from "@/hooks/useFetch";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

// Updated to match actual API response
interface Plant {
  id: string;
  name: string;
  category: string;
  recommendedSoil: string;
  description: string;
  isActive: boolean;
}

// Updated filters to match actual categories from backend
const filterOptions = [
  { id: "all", label: "All Types", value: "all" },
  { id: "LEAFY_GREENS", label: "Leafy Greens", value: "LEAFY_GREENS" },
  { id: "HERBS", label: "Herbs", value: "HERBS" },
  { id: "TROPICAL_GREENS", label: "Tropical Greens", value: "TROPICAL_GREENS" },
  { id: "ROOT_AND_STALK", label: "Root & Stalk", value: "ROOT_AND_STALK" },
];

// Makes category readable e.g. LEAFY_GREENS -> Leafy Greens
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

  const { showModal, handleConfirm, handleCancel } =
    useBackWarning(!!selectedPlant);

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

  const loadPlants = async () => {
    setLoadingPlants(true);
    try {
      const result = await fetchPlants();
      console.log("Raw plants result:", JSON.stringify(result, null, 2)); // 👈 log everything

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
  };

  useEffect(() => {
    loadPlants();
  }, []);

  const handleNextPress = () => {
    if (!selectedPlant) return;
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
      recommendedSoil: selectedPlant.recommendedSoil,
    });
  };

  const filteredPlants =
    selectedFilter === "all"
      ? plants
      : plants.filter((plant) => plant.category === selectedFilter);

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}
      >
        <Text style={typography["h1-bold"]} className="text-black mb-3 pl-2">
          Choose your Plant
        </Text>
        <Text
          style={typography["subheader"]}
          className="mb-5 text-gray-700 leading-normal pl-2"
        >
          Choose a plant to add to your{" "}
          <Text style={typography["subheader-bold"]} className="text-black">
            Nurtura Rack
          </Text>
          .
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 8 }}
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
                category={formatCategory(plant.category)} // 👈 formatted label
                onPress={() => setSelectedPlant(plant)}
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
      <ConfirmationModal
        isVisible={showModal}
        onConfirm={handleConfirm}
        title="Go Back"
        message="All details you have entered will be restarted and gone."
        confirmText="Continue"
        cancelText="Cancel"
        onCancel={handleCancel}
      />
    </View>
  );
};

export default AddNewPlant2;
