import { Composer } from "grammy";

import { db } from "@acme/db/client";

import { globalCtx } from "../../route";
import {
  CommandNames,
  composeForm,
  formField,
  initComposer,
} from "../../utils/form-composer";
import { albumList } from "../actions";

const cmdName: CommandNames = "open_album_for_import";

const form = composeForm({
  fields: [formField("albumId", "Album")],
})
  ._addLists({
    async albumId(kb, data) {
      return {
        list: await albumList(),
      };
    },
  })
  ._onInputs({
    async albumId(val, fd, type) {
      if (type == "text") throw new Error("Invalid Input");
      return {
        value: Number(val),
      };
    },
  })
  ._onSubmit(async (formData, ctx) => {
    globalCtx.audioData.albumId = Number(formData.albumId);
    await ctx.reply("Blog Opened");
  });

const _ctx = initComposer(cmdName, form);
const openAlbumForImportComposer = new Composer();
openAlbumForImportComposer.command(cmdName, _ctx.command);
openAlbumForImportComposer.callbackQuery(_ctx.cbqPattern, _ctx.callbackQuery);
export default openAlbumForImportComposer;
