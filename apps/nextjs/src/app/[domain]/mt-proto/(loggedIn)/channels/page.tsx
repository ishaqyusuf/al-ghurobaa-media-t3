import Container from "~/app/_components/container";
import { channelsListDta } from "~/data-access/channels.dta";
import ChannelClient from "./page.client";

export default async function Channels({ searchParams }) {
  const promise = channelsListDta(searchParams);
  return (
    <Container>
      <ChannelClient promise={promise} />
    </Container>
  );
}
