"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";

import { cn } from "@acme/ui";
import { Badge } from "@acme/ui/badge";
import { Menu } from "@acme/ui/common/menu";
import TextWithTooltip from "@acme/ui/common/text-with-tooltip";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import type { channelsListDta } from "~/data-access/channels.dta";
import type { AsyncFn } from "~/type";
import Header from "~/app/_components/header";
import { updateChannelListDta } from "~/data-access/channels.dta";
import { arabic } from "~/fonts";

export default function ChannelClient({ promise }) {
  const list = use<AsyncFn<typeof channelsListDta>>(promise);
  const [q, setQ] = useQueryState("q", {
    defaultValue: "",
    throttleMs: 800,
  });
  // useEffect(() => {
  //   console.log(list?.length);
  // }, [list]);
  async function updateChannelList() {
    toast.promise(
      () =>
        new Promise((resolve) => {
          updateChannelListDta().then((res) => {
            resolve("success");
          });
        }),
      {
        success: (data) => {
          return "Updated";
        },
        error: "Error",
      },
    );
    await updateChannelListDta();
  }
  return (
    <div className="w-2/3s mr-4 flex flex-col">
      <Header
        title="Channels"
        Actions={
          <>
            <Menu.Item onClick={updateChannelList}>Update Channels</Menu.Item>
            <Menu.Item
              SubMenu={
                <>
                  <Menu.Item href={"/mt-proto/channels"}>All</Menu.Item>
                  <Menu.Item href={"/mt-proto/channels?show=scrapes"}>
                    With Scrapes
                  </Menu.Item>
                </>
              }
            >
              Filter
            </Menu.Item>
          </>
        }
      >
        <Input
          value={q}
          placeholder="Search"
          onChange={(e) => setQ(e.target.value)}
          className="h-7 w-48 font-mono"
        />
      </Header>
      {list?.map((channel, index) => (
        <Link
          href={`/mt-proto/channels/${channel.username}`}
          className={cn(
            channel.rtl ? `flex flex-row-reverse ${arabic.className}` : "flex",
            "border-b px-4 py-1 hover:bg-muted-foreground/50",
          )}
          key={index}
        >
          <span>{index + 1}</span>
          <span>{". "}</span>
          <div className="inline-flex items-center space-x-2">
            <TextWithTooltip
              className="max-w-xs"
              text={channel.title?.trim()}
            />
            <span className="text-muted-foreground">{channel.username}</span>
            <Badge>{channel._count?.forwards}</Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
