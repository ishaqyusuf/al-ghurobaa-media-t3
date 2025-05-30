import { Suspense } from "react";

import { AuthShowcase } from "~/components/auth-showcase";
import { HydrateClient } from "~/trpc/server";

// export const runtime = "edge";

export default async function HomePage() {
  // const schools = await db.query.School.findMany();

  // You can await this here if you don't want to show Suspense fallback below
  // void api.post.all.prefetch();
  // db.al
  return (
    <HydrateClient>
      <main className="container h-screen py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Creates <span className="text-primary">T3</span> Turbo
          </h1>
          <div className="">
            {/* {schools.map((s) => (
              <div id={s.id}>{s.name}</div>
            ))} */}
          </div>
          <AuthShowcase />
          {/* <Bootstrap />
          <CreatePostForm /> */}
          <div className="w-full max-w-2xl overflow-y-scroll">
            <Suspense
              fallback={
                <div className="flex w-full flex-col gap-4">
                  {/* <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton /> */}
                </div>
              }
            >
              {/* <PostList /> */}
            </Suspense>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
