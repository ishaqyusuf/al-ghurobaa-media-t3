import "@bacons/text-decoder/install";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

import { TRPCProvider } from "~/utils/api";

import "../styles.css";

import { useEffect } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalHost, PortalProvider } from "@gorhom/portal";

import AudioPlayer from "./components/audio-player";
import BottomNav from "./components/bottom-nav";

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <TRPCProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PortalProvider>
          <SafeAreaView
            className=""
            style={{
              flex: 1,
              backgroundColor: colorScheme === "dark" ? "#09090B" : "#FFFFFF",
            }}
          >
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: "#f472b6",
                },
                header: () => (
                  <View className="mt-8">
                    <PortalHost name="header" />
                  </View>
                ),
                // headerShown: false,
                // statusBarHidden: true,
                // statusBarTranslucent: true,
                statusBarStyle: "light",
                statusBarBackgroundColor: "black",
                contentStyle: {
                  backgroundColor:
                    colorScheme == "dark" ? "#09090B" : "#FFFFFF",
                },
              }}
            />
            <StatusBar />
            <AudioPlayer />
            <BottomNav />
          </SafeAreaView>
        </PortalProvider>
      </GestureHandlerRootView>
    </TRPCProvider>
  );
}
