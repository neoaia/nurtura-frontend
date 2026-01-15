import AddPlantButton from "@/components/add_plant/addPlantBtn";
import PlantDetailHeader from "@/components/add_plant/plantDetailHeader";
import AddRackButton from "@/components/racks/addRackItemBtn";
import PlantStatusIndicators from "@/components/racks/plantStatusIndicators";
import RackItem from "@/components/racks/rackItem";
import TotalHarvestCard from "@/components/racks/totalHarvestCard";
import Dropdown from "@/components/shared/dropdown";
import SmallDescription from "@/components/shared/smallDescription";
import { ScrollView, View } from "react-native";

export default function RacksScreen() {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="flex justify-center items-center h-1300 px-5">
        <AddRackButton onPress={() => console.log("Add Rack Pressed")} />
        <AddPlantButton onPress={() => console.log("Add Plant Pressed")} />
        <RackItem
          name="My First Rack"
          plant="Lettuce"
          leaves={24}
          water={1.5}
          humidity={60}
          temperature={22}
          hasAlert={true}
          onMorePress={() => console.log("More Pressed")}
        />
        <TotalHarvestCard totalGrams={600} sinceDate="July 23, 2025" />
        <PlantStatusIndicators type="temperature" value="26°" />
        <PlantStatusIndicators type="humidity" value="85%" />
        <PlantStatusIndicators type="soil-moisture" value=".20" />
        <SmallDescription label="Plant Name" value="Malunggay" />
        <Dropdown
          placeholder="Select your device here"
        />
        <PlantDetailHeader />
      </View>
    </ScrollView>
  );
}
