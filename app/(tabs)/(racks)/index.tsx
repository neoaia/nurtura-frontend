import { typography } from "@/assets/fonts/Text";
import AddRackButton from "@/components/racks/addRackItemBtn";
import RackItem from "@/components/racks/rackItem";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const rackId = "1";

export default function RacksScreen() {
  const handleCardPress = () => {
    console.log("Card clicked!");
    router.push(`/(tabs)/(racks)/${rackId}` as any); // temporary lang for testing loveu
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
    </>
  );
}
