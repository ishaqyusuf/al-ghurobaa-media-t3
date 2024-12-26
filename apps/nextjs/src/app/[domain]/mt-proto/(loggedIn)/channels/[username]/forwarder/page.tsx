"use client";

import Button from "@acme/ui/common/button";

import { Context, useCreateForwardPageContext } from "./ctx";
import { ForwarderWatchers } from "./forward-watcher";

export default function ForwardPage({ params }) {
  const username = params.username;
  const ctx = useCreateForwardPageContext(username);
  const { id, _meta, _count, form, startUploading } = ctx;
  if (!id) return null;
  return (
    <Context.Provider value={ctx}>
      <h1>Forwarder</h1>
      <p>Scraped: {_count?.forwards}</p>
      <Button disabled={_meta.status != "idle"} onClick={startUploading}>
        Start Uploading
      </Button>
      <ForwarderWatchers />
    </Context.Provider>
  );
}
