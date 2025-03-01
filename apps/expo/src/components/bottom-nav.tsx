import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";

import { Icon, Icons } from "./icon";

export default function BottomNav({}) {
  return (
    <View className="fixed bottom-0 flex flex-row justify-between gap-4 bg-transparent p-2">
      <NavItem icon={"home"} title="Home" href={"/"} />
      <NavItem icon={"search"} title="Search" href={"/"} />
      <NavItem icon={"library"} title="Your Library" href={"/"} />
      <NavItem icon={"settings"} title="Settings" href={"/"} />
    </View>
  );
  {
    /* </LinearGradient> */
  }
}
interface NavItemProps {
  href;
  title;
  icon: Icons;
}
function NavItem(props: NavItemProps) {
  return (
    <Link href={props.href} className="">
      <View className="flex-col items-center justify-center p-2">
        <Icon icon={props.icon} size={32} color={"grey"} />
        <Text className="text-xs">{props.title}</Text>
      </View>
    </Link>
  );
}
