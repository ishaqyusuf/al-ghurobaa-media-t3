import { channelList, scrapeChannel } from "module/telegram-scrape/channel";

import { Button } from "@acme/ui/button";
import { Label } from "@acme/ui/label";

import useEffectLoader from "~/utils/use-effect-loader";
import { loadChannels } from "../server";

export default function ListChannels() {
  const loader = useEffectLoader(channelList);
  const loader2 = useEffectLoader(scrapeChannel);

  return (
    <div>
      <Label>Channels</Label>
      <Button
        onClick={() => {
          loader.refresh();
        }}
      >
        Reload
      </Button>
      <Button
        onClick={() => {
          loader2.refresh();
        }}
      >
        Scrape Channel
      </Button>
    </div>
  );
}
