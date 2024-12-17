import type { Message } from "grammy/types";

import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { Album, MediaAuthor } from "@acme/db/schema";

export const albumsPromptList = ["albums", "album-schema", "create-album"];
export async function createAlbumPrompt(msg: Message) {}
export async function getAlbumsPrompt() {
  const _albums = await db
    .select()
    .from(Album)
    .leftJoin(MediaAuthor, eq(Album.mediaAuthorId, MediaAuthor.id))
    .finally();
  const albums = await db.query.Album.findMany({
    with: {
      mediaAuthor: true,
    },
  });
  return albums
    .map(
      (a) =>
        `${a.id}. ${a.name} ${a.mediaAuthor ? `-- ${a.mediaAuthor.name}` : ""}`,
    )
    .join("\n");
}
