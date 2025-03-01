import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Link, router, useGlobalSearchParams, usePathname } from "expo-router";

import { cn } from "./cn";

interface ChipProps {
  children?;
  href?;
}
export function LinkChip(props: ChipProps) {
  const local = useGlobalSearchParams();
  const path = usePathname();
  // const route = useurl();
  // const [active, setActive] = useState(false);

  const active = useMemo(() => {
    const [url, query] = props.href?.split("?");
    const __active = query?.split("&")?.every((a) => {
      const [qk, qv] = a?.split("=");
      return local[qk] == qv;
    });
    const active = Object.entries(local).every(([k, v]) => {
      const inQuery = props.href?.includes(`${k}=`);
      return !inQuery ? true : query?.includes(`${k}=${v}`);
    });
    const _active =
      (__active || (!query && !Object.keys(local)?.length)) && url == path;
    // setActive(_active);
    return _active;
  }, [local, props.href, path]);
  // useEffect(() => {
  //   setActive(isActive);
  // }, [isActive]);
  return (
    <Link className="" href={props.href}>
      <View
        className={cn(
          "flex h-10 justify-center rounded-full px-4",
          active ? "bg-green-500" : "bg-muted",
        )}
      >
        <Text className={cn(active ? "text-black" : "text-white")}>
          {props.children}
        </Text>
      </View>
    </Link>
  );
}
