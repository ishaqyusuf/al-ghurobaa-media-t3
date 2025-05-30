"use server";

import { revalidatePath } from "next/cache";

import { db } from "@acme/db";

export async function updateChannelFavouriteAction(id, fav) {
  await db.channel.update({
    where: { id },
    data: {
      favourite: fav,
    },
  });
  revalidatePath("/mt-proto/channels");
}
