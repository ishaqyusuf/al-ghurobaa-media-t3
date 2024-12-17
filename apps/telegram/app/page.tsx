import { env } from "~/env";

export default async function HomePage() {
  const tok = env.TELEGRAM_TOKEN;
  const url = env.TELEGRAM_WEBHOOK;
  function href(local = false) {
    return `https://api.telegram.org/bot${tok}/setWebhook?url=${url}`;
  }
  return (
    <div className="">
      {/* <a href={href(true)}>Register Webhook</a> */}
      <div className="flex h-screen flex-col">
        <span>L:RE</span>
      </div>
    </div>
  );
}
