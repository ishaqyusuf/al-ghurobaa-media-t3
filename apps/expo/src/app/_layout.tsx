import "@bacons/text-decoder/install";

import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

import { TRPCProvider } from "~/utils/api";

import "../styles.css";

import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalHost, PortalProvider } from "@gorhom/portal";

import { cn } from "~/components/cn";
import { SheetProvider } from "~/components/common/sheet/provider";
import { Icon } from "~/components/icon";
import { useStore } from "~/store/store";

// This is the main layout of the app
// It wraps your pages with the providers they need

function TabIcon({ name, focused }) {
  return <Icon icon={name} size={16} color={"white"} />;
}
export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const sheetOpened = useStore((state) => state.sheetOpened);
  return (
    <TRPCProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PortalProvider>
          <SheetProvider>
            <StatusBar style="light" backgroundColor="black" />
            <Tabs
              screenOptions={{
                tabBarHideOnKeyboard: true,

                tabBarActiveTintColor: "#ffd33d",
                headerStyle: {
                  backgroundColor: "#25292e",
                },
                headerShadowVisible: false,
                headerTintColor: "#fff",
                tabBarStyle: {
                  backgroundColor: "#25292e",
                  display: sheetOpened ? "none" : "flex",
                },
                // tabBarIcon: ({ focused }): React.ReactElement =>
                // TabBarIcon(focused),
                tabBarLabel(props) {
                  return (
                    <Text
                      className={cn("text-sm text-white", props?.focused && "")}
                    >
                      {props.children}
                    </Text>
                  );
                },
              }}
            >
              <Tabs.Screen
                name="index"
                options={{
                  title: "Home",

                  headerStyle: {
                    backgroundColor: "#f472b6",
                  },
                  tabBarIcon(props) {
                    return <TabIcon {...props} name="home" />;
                  },
                  header: () => (
                    <View
                      className="mt-8"
                      style={{ backgroundColor: "#09090B" }}
                    >
                      <PortalHost name="header" />
                    </View>
                  ),
                }}
              />
            </Tabs>
          </SheetProvider>
        </PortalProvider>
      </GestureHandlerRootView>
    </TRPCProvider>
  );
}
