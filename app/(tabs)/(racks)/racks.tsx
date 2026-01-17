import AddRackButton from "@/components/racks/addRackItemBtn";
import RackItem from "@/components/racks/rackItem";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RacksScreen() {
  const handleCardPress = () => {
    console.log("Card clicked!");
    router.push("/(tabs)/(racks)/rackInfo");
  };

  return (
    <SafeAreaView className="bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex justify-center items-center px-4 bg-white">
          <View className="flex justify-start items-start w-full mb-2 mt-8 pl-3">
            <Text className="text-black font-bold text-5xl mb-[20px] pl-2">
              Racks
            </Text>
          </View>

          <RackItem
            name="My First Rack"
            plant="Lettuce"
            leaves={24}
            water={1.5}
            humidity={60}
            temperature={22}
            hasAlert={true}
            onMorePress={() => console.log("More Pressed")}
            onPress={() => handleCardPress()}
          />

          <AddRackButton onPress={() => console.log("Add Rack Pressed")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
