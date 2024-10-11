import { Composer } from "grammy";

import { db } from "@acme/db/client";

import {
  CommandNames,
  composeForm,
  formField,
  initComposer,
} from "../../utils/form-composer";
import { albumList, createAlbum, createAuthor } from "../actions";

const cmdName: CommandNames = "create_album";

const form = composeForm({
  fields: [
    formField("album", "Album"),
    formField("author", "Author"),
    formField("authorId", "Author Id"),
    formField("albumType", "Album Type"),
  ],
})
  ._onInputs({
    async author(value, formData, inputType) {
      let skip = 1;
      if (inputType == "btn") {
        formData.authorId = value;
      } else formData.author = value;
      return {
        skip,
      };
    },
  })
  ._addLists({
    async album(s, data) {
      return {
        list: await albumList(),
      };
    },
  })
  ._onSubmit(async (formData, ctx) => {
    if (!formData.authorId) {
      const author = await createAuthor(formData.author);
      formData.authorId = author.id;
    }
    if (formData.authorId) {
      await createAlbum({
        albumType: formData.albumType,
        mediaAuthorId: formData.authorId,
        name: formData.album,
      });
      await ctx.reply("Album Created");
    }
  });

const _ctx = initComposer(cmdName, form);
const createAlbumComposer = new Composer();
createAlbumComposer.command(cmdName, _ctx.command);
createAlbumComposer.callbackQuery(_ctx.cbqPattern, _ctx.callbackQuery);
export default createAlbumComposer;

//   ._addList("album", async (s, data) => {
//     const albums = await db.query.Album.findMany({
//       with: {
//         mediaAuthor: true,
//       },
//     });
//     return {
//       list: albums.map((l) => ({
//         label: `${l.name} | ${l.mediaAuthor?.name}`,
//         value: `${l.id}`,
//       })),
//     };
//   })
//   ._onInput("album", async (value, formData, inputType) => {
//     let skip = 1;
//     if (inputType == "btn") {
//       formData.albumId = value;
//       skip = 2;
//     } else formData.album = value;
//     return {
//       skip,
//     };
//   });
