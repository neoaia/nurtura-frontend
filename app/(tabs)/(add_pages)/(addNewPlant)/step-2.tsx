import { typography } from "@/assets/fonts/Text";
import PlantCard from "@/components/add_plant/plantCard";
import PlantFilterBtn from "@/components/add_plant/plantFilterBtn";
import { BottomButton } from "@/components/shared/bottomButton";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";

const plantsData = [
  { id: "1", name: "Lettuce", category: "Leafy Greens", type: "leafy" },
  { id: "2", name: "Radish", category: "Leafy Greens", type: "leafy" },
  { id: "3", name: "Bush Bean", category: "Greens", type: "greens" },
  { id: "4", name: "Bush Bean", category: "Greens", type: "greens" },
  { id: "5", name: "Spinach", category: "Leafy Greens", type: "leafy" },
  { id: "6", name: "Kale", category: "Leafy Greens", type: "leafy" },
];

const AddNewPlant2 = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedPlant, setSelectedPlant] = useState<any>(null);

  const handleNextPress = () => {
    if (selectedPlant) {
      router.push({
        pathname: "/(tabs)/(add_pages)/(addNewPlant)/step-3",
        params: {
          // rack data
          rackId: rackId,
          rackName: rackName,
          rackValue: rackValue,
          // plant data
          plantId: selectedPlant.id,
          plantName: selectedPlant.name,
          plantCategory: selectedPlant.category,
          plantType: selectedPlant.type,
        },
      });
    }
  };

  const handleFilterBtnPress = (filter: string) => {
    setSelectedFilter(filter);
    console.log("filter btn pressed:", filter);
  };

  const handlePlantPress = (plant: any) => {
    setSelectedPlant(plant);
    console.log("plant selected:", plant);
  };

  const { rackId, rackName, rackValue } = useLocalSearchParams<{
    rackId: string;
    rackName: string;
    rackValue: string;
  }>();

  const filteredPlants =
    selectedFilter === "all"
      ? plantsData
      : plantsData.filter((plant) => plant.type === selectedFilter);

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4 "
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
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
          <PlantFilterBtn
            title="All Types"
            onPress={() => handleFilterBtnPress("all")}
          />
          <PlantFilterBtn
            title="Herbs"
            onPress={() => handleFilterBtnPress("herbs")}
          />
          <PlantFilterBtn
            title="Fruit Vegetables"
            onPress={() => handleFilterBtnPress("fruit")}
          />
          <PlantFilterBtn
            title="Leafy Greens"
            onPress={() => handleFilterBtnPress("leafy")}
          />
        </ScrollView>

        <View className="flex-row flex-wrap justify-between">
          {filteredPlants.map((plant) => (
            <PlantCard
              key={plant.id}
              plantName={plant.name}
              category={plant.category}
              onPress={() => handlePlantPress(plant)}
              isSelected={selectedPlant?.id === plant.id}
            />
          ))}
        </View>
      </ScrollView>

      <BottomButton
        title="Next"
        onPress={handleNextPress}
        disabled={!selectedPlant} // Disable if no plant selected
      />
    </View>
  );
};

export default AddNewPlant2;
