import Container from "~/components/container";
import { WorkerClient } from "~/components/worker-client";

export default async function Page({}) {
  return (
    <Container>
      <WorkerClient />
    </Container>
  );
}
