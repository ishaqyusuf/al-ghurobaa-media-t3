import Link from "next/link";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";

import { arabic } from "~/fonts";
import { loadChannels } from "../../lib/action";

export default async function Channels({}) {
  const channels = await loadChannels();
  return (
    <div>
      <div>CHANNELS</div>
      {channels?.map((channel, index) => (
        <Link
          href={`/mt-proto/channels/${channel.username}`}
          className={cn(
            channel.rtl ? `flex justify-end ${arabic.className}` : "",
            "border-b px-4 py-1",
          )}
          key={index}
        >
          {/* <span>{index + 1}.</span> */}
          <div>
            <span>{channel.title}</span>
          </div>
          <div>{/* <span>{channel.username}</span> */}</div>
          {/* <span>{channel.id.toJSON().id}</span> */}
        </Link>
      ))}
    </div>
  );
}
