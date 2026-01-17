import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LogOutRow } from "@/components/settings/logoutTab";
import { ProfileCard } from "@/components/settings/profileCard";
import { SettingsRow } from "@/components/settings/settingsTab";


export default function AccountScreen() {
    return (
        <SafeAreaView>
            <ScrollView>
                <ProfileCard 
                    name="Juan Dela Cruz" 
                    username="JuanMasipag" 
                    iconSource={require("@/assets/images/user-icon-settings.png")}
                />
                <SettingsRow
                    iconSource={require("@/assets/images/user-info-icon.png")}
                    label="User Information"
                    onPress={() => console.log("Pressed")}
                />
                <SettingsRow
                    iconSource={require("@/assets/images/security-icon.png")}
                    label="Account Security"
                    onPress={() => console.log("Pressed")}
                />
                <LogOutRow
                    iconSource={require("@/assets/images/logout-icon.png")}
                    label="Log Out"
                    onPress={() => console.log("Pressed")}
                />
            </ScrollView>
        </SafeAreaView>
    )
}