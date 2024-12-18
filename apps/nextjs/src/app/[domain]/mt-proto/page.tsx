import { redirect } from "next/navigation";

import { isLoggedIn } from "./lib/action";
import PageClient from "./page.client";

export default async function MtProtoPage({}) {
  const _isLoggedIn = await isLoggedIn();
  console.log(_isLoggedIn);

  if (_isLoggedIn) redirect("/mt-proto/channels");

  return (
    <>
      <span>MTPROTO</span>
      <PageClient />
    </>
  );
}
