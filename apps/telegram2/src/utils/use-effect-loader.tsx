"use client";

import { useEffect, useState } from "react";

interface Props {
  onSuccess?;
  onError?;
  transform?;
}
export default function useEffectLoader<T extends (...args: any) => any>(
  fn: T,
  {}: Props = {},
) {
  type DataType = Awaited<NonNullable<ReturnType<T>>>;
  const [data, setData] = useState<DataType>();
  const [ready, setReady] = useState(false);
  const [refreshToken, setRefreshToken] = useState(null);
  useEffect(() => {
    load();
  }, []);
  async function load(r = false) {
    if (!fn) return;
    const res = await fn();
    console.log(">>LOADING", res);
    console.log("....");
    (fn as any)()?.then((res) => {
      console.log(res);
      setData(res);
      setReady(true);
      // if (r) setRefreshToken(generateRandomString());
    });
  }
  return {
    data,
    ready,
    refresh: async () => await load(true),
    refreshToken,
  };
}
