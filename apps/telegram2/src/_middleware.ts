import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { env } from "./env.js";

// export { auth as middleware } from "@acme/auth";

// Or like this if you need to do something here.
// export default auth((req) => {
//   console.log(req.auth) //  { session: { user: { ... } } }
// })

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = req.headers
    .get("host")!
    .replace(".localhost:3008", `.localhost:3008`);

  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;
  // if (
  //   hostname === "localhost:7000" ||
  //   hostname === env.NEXT_PUBLIC_ROOT_DOMAIN
  // ) {
  //   // console.log("..");
  //   return NextResponse.rewrite(
  //     new URL(`/public${path === "/" ? "" : path}`, req.url),
  //   );
  // }
  // // console.log(">>>>>>>>>>>>>>>");
  // // rewrite everything else to `/[domain]/[slug] dynamic route
  // console.log(["+++TENANT+++", hostname, path]);
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}
