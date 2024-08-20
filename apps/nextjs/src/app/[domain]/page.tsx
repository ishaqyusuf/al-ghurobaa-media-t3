import { Suspense } from "react";

import { db } from "@acme/db/client";

import { api, HydrateClient } from "~/trpc/server";
import { AuthShowcase } from "../_components/auth-showcase";
import Bootstrap from "../_components/bootstrap";
import {
  CreatePostForm,
  PostCardSkeleton,
  PostList,
} from "../_components/posts";

export const runtime = "edge";

export default async function HomePage() {
  const schools = await db.query.School.findMany();

  // You can await this here if you don't want to show Suspense fallback below
  void api.post.all.prefetch();

  return (
    <HydrateClient>
      <main className="container h-screen py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-primary">T3</span> Turbo
          </h1>
          <div className="">
            {schools.map((s) => (
              <div id={s.id}>{s.name}</div>
            ))}
          </div>
          <AuthShowcase />
          <Bootstrap />
          <CreatePostForm />
          <div className="w-full max-w-2xl overflow-y-scroll">
            <Suspense
              fallback={
                <div className="flex w-full flex-col gap-4">
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </div>
              }
            >
              <PostList />
            </Suspense>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}