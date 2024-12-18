import { Button } from "@acme/ui/button";

import { loadChannels } from "../../lib/action";

export default async function Channels({}) {
  const channels = await loadChannels();
  return (
    <div>
      <div>CHANNELS</div>
      {channels?.map((channel) => (
        <div className="" key={channel.id}>
          <span>{channel.title}</span>
        </div>
      ))}
    </div>
  );
}
