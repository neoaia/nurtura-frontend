import { typography } from "@/assets/fonts/Text";
import AddRackButton from "@/components/racks/addRackItemBtn";
import RackItem from "@/components/racks/rackItem";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RacksScreen() {
  const handleCardPress = (rackId: string) => {
    console.log("Card clicked!");
    router.push(`/(tabs)/(racks)/${rackId}` as any); // temporary lang for testing loveu
  };

  const handleAddRack = () => {
    router.push("/(tabs)/(add_pages)/(addNewRack)");
  };

  const mockRack = {
    id: "1",
    name: "My First Rack",
    plant: "Lettuce",
    image: undefined,
    leaves: 24,
    water: 1.5,
    humidity: 60,
    temperature: 22,
    hasAlert: true,
    onPress: () => handleCardPress("1"),
    onMorePress: () => console.log("More Pressed"),
  };

  return (
    <>
      <SafeAreaView className="bg-white flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex justify-center items-center px-4 bg-white">
            <View className="flex justify-start items-start w-full mb-2 mt-8 pl-3">
              <Text
                style={typography["title-bold"]}
                className="text-black text-5xl mb-[20px]"
              >
                Racks
              </Text>
            </View>

            <RackItem rack={mockRack} />

            <AddRackButton onPress={() => handleAddRack()} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
