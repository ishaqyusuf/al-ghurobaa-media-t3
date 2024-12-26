import Link from "next/link";

export default async function Layout({ children, params }) {
  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/mt-proto/channels/${params.username}/forwarder`}>
          Forwarder
        </Link>
        <Link href={`/mt-proto/channels/${params.username}`}>
          Proto Scraper
        </Link>
      </div>
      {children}
    </div>
  );
}
