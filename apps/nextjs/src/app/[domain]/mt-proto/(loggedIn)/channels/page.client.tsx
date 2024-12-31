"use client";

import { use } from "react";
import Link from "next/link";

import { cn } from "@acme/ui";
import { Menu } from "@acme/ui/common/menu";
import TextWithTooltip from "@acme/ui/common/text-with-tooltip";
import { toast } from "@acme/ui/toast";

import type { channels } from "../../lib";
import type { channelsListDta } from "~/data-access/channels.dta";
import type { AsyncFn } from "~/type";
import Header from "~/app/_components/header";
import { updateChannelListDta } from "~/data-access/channels.dta";
import { arabic } from "~/fonts";

export default function ChannelClient({ promise }) {
  const list = use<AsyncFn<typeof channelsListDta>>(promise);
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
          </>
        }
      />
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

          <TextWithTooltip className="" text={channel.title?.trim()} />
        </Link>
      ))}
    </div>
  );
}
