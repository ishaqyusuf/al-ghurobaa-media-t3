"use client";

import Button from "@acme/ui/common/button";
import { Menu } from "@acme/ui/common/menu";

import Container, { Section } from "~/app/_components/container";
import Header from "~/app/_components/header";
import { clearChannelForwardRecord } from "~/data-access/forward-chat.dta";
import { Context, useCreateForwardPageContext } from "./ctx";
import { ForwarderWatchers } from "./forward-watcher";

export default function ForwardPage({ params }) {
  const username = decodeURIComponent(params.username);
  const ctx = useCreateForwardPageContext(username);
  const { id, _meta, _count, form, startUploading } = ctx;
  if (!id) return null;
  return (
    <Container>
      <Header
        title={`Forwarder: ${username}`}
        back="."
        Actions={
          <>
            <Menu.Item
              onClick={() => {
                clearChannelForwardRecord(username).then((e) => {
                  ctx.init();
                });
              }}
            >
              Clear Channel Record
            </Menu.Item>
          </>
        }
      />
      <Section>
        <Context.Provider value={ctx}>
          <h1>Forwarder:</h1>
          <p>Scraped: {_count?.forwards}</p>
          <Button disabled={_meta.status != "idle"} onClick={startUploading}>
            Start Uploading
          </Button>
          <ForwarderWatchers />
        </Context.Provider>
      </Section>
    </Container>
  );
}
