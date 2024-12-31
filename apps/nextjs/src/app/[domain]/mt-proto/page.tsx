import { redirect } from "next/navigation";

import Container, { Section } from "~/app/_components/container";
import Header from "~/app/_components/header";
import { isLoggedIn } from "./lib/action";
import PageClient from "./page.client";

export default async function MtProtoPage() {
  const _isLoggedIn = await isLoggedIn();
  console.log(_isLoggedIn);

  if (_isLoggedIn) redirect("/mt-proto/channels");

  return (
    <Container>
      <Header title="Sign In" />
      <Section>
        <PageClient />
      </Section>
    </Container>
  );
}
