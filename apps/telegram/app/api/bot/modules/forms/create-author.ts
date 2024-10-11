import { Composer } from "grammy";

import {
  CommandNames,
  composeForm,
  formField,
  initComposer,
} from "../../utils/form-composer";

const cmdName: CommandNames = "create_author";
const form = composeForm({
  fields: [
    formField("name", "Name"),
    formField("email", "Email"),
    formField("password", "Password"),
  ] as const,
})
  ._addList("name", async (s, data) => {
    return {
      list: [{ label: "Ishaq", value: "1" }],
    };
  })
  ._onInput("email", async (value, formData, inputType) => {
    // if (inputType == "") throw Error("Custom input not allowed");
    return { value };
  })
  ._onSubmit(async (data, ctx) => {
    await ctx.reply("Submitting...");
  });
const _ctx = initComposer("create_author", form);

const composer = new Composer();
_ctx.settings.on.callbackQuery = async (ctx) => {
  //
};
_ctx.settings.on.submit = async (data, ctx) => {};

composer.command(cmdName, _ctx.command);
composer.callbackQuery(_ctx.cbqPattern, _ctx.callbackQuery);

export default composer;
