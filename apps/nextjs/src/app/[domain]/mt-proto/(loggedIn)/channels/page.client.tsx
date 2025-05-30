"use client";

import { use } from "react";
import Link from "next/link";
import { useQueryState } from "nuqs";

import { cn } from "@acme/ui";
import { Badge } from "@acme/ui/badge";
import Button from "@acme/ui/common/button";
import { Icons } from "@acme/ui/common/icons";
import { Menu } from "@acme/ui/common/menu";
import TextWithTooltip from "@acme/ui/common/text-with-tooltip";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import type { channelsListDta } from "~/data-access/channels.dta";
import type { AsyncFn } from "~/type";
import { updateChannelFavouriteAction } from "~/actions/update-channel-favourite-action";
import Header from "~/components/header";
import { updateChannelListDta } from "~/data-access/channels.dta";

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
            <Menu.Item href="/mt-proto/worker">Worker</Menu.Item>
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
        <div
          dir=""
          className="relative flex hover:bg-muted-foreground/50"
          key={index}
        >
          <Link
            href={`/mt-proto/channels/${channel.username}`}
            className={cn(
              "relative flex-1",
              // channel.rtl ? `sflex-row-reverse flex ${arabic.className}` : "flex",
              "border-b px-4 py-1",
            )}
          >
            <span>{index + 1}</span>
            <span>{". "}</span>
            <div className="inline-flex items-center space-x-2">
              <div
                className={cn("flex flex-col", channel.rtl && "items-end")}
                dir={channel.rtl ? "rtl" : "ltr"}
              >
                <TextWithTooltip
                  className="max-w-xs"
                  text={channel.title?.trim()}
                />
                <span className="text-muted-foreground">
                  {channel.username}
                </span>
              </div>
            </div>
          </Link>
          <div className="absolute bottom-0 right-0 top-0 z-10 flex items-center">
            <Badge variant={channel._count?.forwards ? "default" : "outline"}>
              {channel._count?.forwards}
            </Badge>
            <Button
              variant={"ghost"}
              onClick={(e) => {
                updateChannelFavouriteAction(
                  channel.id,
                  !channel.favourite,
                ).then((e) => {});
              }}
              className="z-10"
              size="xs"
            >
              <Icons.Heart
                className={cn(
                  "size-4",
                  channel.favourite
                    ? "text-red-600"
                    : "text-muted-foreground/20",
                )}
              />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
