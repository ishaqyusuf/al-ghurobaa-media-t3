import { Composer, InlineKeyboard } from "grammy";

import type { CmdContext } from "./bot";
import { globalCtx } from "../route";

const cmd = <T extends string>(command: T, description?: string) =>
  ({
    command,
    description,
  }) as const;
export const commandList = [
  cmd("quit", "Quit."),
  cmd("upload_media", "Upload Media."),
  cmd("upload_photo", "Upload Photo."),
  cmd("create_author", "Create Author."),
  cmd("create_album", "Create Album"),
  cmd("add_media_to_album", "Add Media to Album."),
  cmd("open_album_for_import", "Open Album for import"),
] as const;
export type CommandNames = (typeof commandList)[number]["command"];
export type InputType = "btn" | "text";
// export type CommandNames = (typeof commandList)[number]["command"];

interface ComposerSettings {
  on?: {
    command?;
    callbackQuery?;
    submit?: (data, ctx) => Promise<void>;
  };
}
interface Field {
  field: string;
  title: string;
}
interface ComposeFormProps<T extends readonly Field[]> {
  fields?: T;
}

export function composeForm<T extends readonly Field[]>({
  fields,
}: ComposeFormProps<T>) {
  type FTypes = FieldTypes2<T>; // Extract field types
  type DataType = {
    [k in FTypes]: any;
  };

  type Plugins = Partial<
    Record<
      FTypes,
      {
        list?: ListFn;
        input?: OnInput;
      }
    >
  >;
  // {
  //   [k in FTypes]: {
  //     list?: ListFn;
  //     input?: OnInput;
  //   };
  // };
  type ListFn = (
    keyboard: InlineKeyboard,
    data: DataType,
    // cbKeyFn: (k: string) => string,
  ) => Promise<{ list: { label: string; value: string }[] }>;
  type OnInput = (
    value: string,
    formData: DataType,
    inputType: InputType,
  ) => Promise<{ skip?; value? }>;
  interface FormSettings {
    // list?: { [k in FTypes]: Promise<any> };
    list?: Partial<Record<FTypes, ListFn>>;
    validate?: Partial<Record<FTypes, Promise<any>>>;
    onInput?: Partial<Record<FTypes, OnInput>>;
    on: {
      onSubmit: OnSubmit;
    };
    // onCallback?: Partial<Record<FTypes, Promise<any>>>;
    // transformList?: Partial<Record<FTypes, Promise<any>>>;
    // renderList?: Partial<Record<FTypes, Promise<any>>>;
  }
  const settings: FormSettings = {
    onInput: {},
    list: {},
    on: {
      onSubmit: null as any,
    },
  };
  const _ctx = {
    ...settings,
    fields,
    _onInput(c: FTypes, fn: OnInput) {
      settings.onInput[c] = fn;
      return _ctx;
    },
    _onInputs(inputs: Partial<Record<FTypes, OnInput>>) {
      Object.entries(inputs).map(([k, fn]) => {
        _ctx._onInput(k, fn);
      });
      return _ctx;
    },
    _addLists(
      inputs: Partial<
        Record<
          FTypes,
          (
            keyboard: InlineKeyboard,
            data: DataType,
            // cbKeyFn: (k: string) => string,
          ) => Promise<{ list: { label: string; value: string }[] }>
        >
      >,
    ) {
      Object.entries(inputs).map(([k, fn]) => {
        _ctx._addList(k, fn);
      });
      return _ctx;
    },
    _plugins(p: Plugins) {
      Object.entries(p).map(([k, { list, input }]) => {
        if (list) _ctx._addList(k, list);
        if (input) _ctx._onInput(k, input);
      });
      return _ctx;
    },
    _addList(c: FTypes, fn: ListFn) {
      settings.list[c] = fn;
      return _ctx;
    },
    _onSubmit(fn: (formData: DataType, ctx) => Promise<any>) {
      settings.on.onSubmit = fn;
      return _ctx;
    },
  };
  return _ctx;
}
type ComposeForm = ReturnType<typeof composeForm>;

export const initComposer = (cmdName: CommandNames, form: ComposeForm) => {
  const composer = new Composer();
  const cbqPattern = new RegExp(`^${cmdName}|(.+)$`);
  const settings: ComposerSettings = {
    on: {},
  };
  let tempMsgs = [];
  function _temp(msg) {
    if (!msg) return null;
    tempMsgs.push(msg.message_id);
  }
  async function _clearTemps(ctx) {
    try {
      if (!tempMsgs.length) return;
      // _temp(await _delete)
      // await ctx.api.deleteMessages(ctx.chat.id, tempMsgs);

      // tempMsgs = [];
      // _temp(await ctx.reply("Msg cleared"));
    } catch (error) {
      _temp(await ctx.reply(`Unable to clear ${tempMsgs.join(",")}`));
    }
    // let ids: any[] = Object.entries(tempMsgs)
    //   .map(([k, v]) => (!v ? k : false))
    //   .filter(Boolean);
    // _temp(await ctx.reply(`Clearing msgs: ${ids.join(",")}`));
    // try {
    //   await ctx.api.deleteMessages(ctx.chat.id, ids);
    //   ids.map((id) => (tempMsgs[id] = false));
    // } catch (error) {}
  }
  let fieldIndex = 0;
  async function renderField(ctx) {
    const field = form.fields[fieldIndex];
    const title = `${fieldIndex + 1}. ${field?.title}: `;

    const _fieldList = form.list[field.field];
    // await ctx.reply(`${_fieldList?.length} list`);
    function cbKeyFn(k) {
      const kname = `${cmdName}|${field.field}|${k}`;
      return kname;
    }
    if (_fieldList) {
      const keyb = new InlineKeyboard();
      const { list } = await _fieldList(keyb, formData);
      // console.log(JSON.stringify(list));
      list.map((item, index) => {
        keyb.text(item.label, cbKeyFn(item.value));
        if (index % 0 == 1) keyb.row();
      });
      _temp(
        await ctx.reply(null, {
          reply_markup: keyb,
        }),
      );
    } else _temp(await ctx.reply(title));
  }
  let formData = {};

  async function clearForm() {
    //
  }
  async function nextInput(ctx) {
    fieldIndex++;
    if (form.fields.length == fieldIndex) {
      const __submit = form.on.onSubmit;
      if (__submit) await __submit(formData, ctx);
      await clearForm();
      return;
    }
    await renderField(ctx);
  }
  async function processInput(ctx, val, type: "btn" | "text") {
    const field = form.fields[fieldIndex];
    const __onInput = form.onInput[field.field];
    try {
      // console.log()
      if (__onInput) {
        const t = await __onInput?.(val, formData, type);
        if (typeof t == "object") {
          const { value, skip } = t;
          if (value != undefined) {
            formData[field.field] = val;
          }
          fieldIndex += skip || 0;
        }
      } else formData[field.field] = val;
      _temp(
        await ctx.reply(
          Object.entries(formData)
            ?.map(([k, v]) => `${k}: ${v}`)
            .join("\n"),
        ),
      );
      await nextInput(ctx);
    } catch (error) {
      if (error instanceof Error) {
        _temp(await ctx.reply(error.message));
      }
      await renderField(ctx);
    }
  }
  const _ctx = {
    settings,
    form,
    composer,
    cmdName,
    renderField,
    cbqPattern,
    command: async (ctx: CmdContext) => {
      globalCtx.botInstance = cmdName;
      _temp(ctx.message);
      await _clearTemps(ctx);
      // await ctx.deleteMessage();

      formData = {};
      if (form) {
        fieldIndex = 0;
        await renderField(ctx);
      } else {
        _temp(await ctx.reply(`Form not found: ${form.fields?.length}`));
      }
      globalCtx.on.text[cmdName] = _ctx.onText;
    },
    onText: async (ctx) => {
      _temp(ctx.message);
      // await ctx.api.deleteMessage();
      await _clearTemps(ctx);
      await processInput(ctx, ctx.message.text, "text");
    },
    callbackQuery: async (ctx) => {
      _temp(ctx.message);
      await _clearTemps(ctx);
      // await ctx.api.deleteMessage();
      const data = ctx.callbackQuery.data;
      const [comnd, formk, val] = data.split("|");
      await settings.on.callbackQuery?.(ctx);
      await processInput(ctx, val, "btn");
    },
    validate() {
      if (globalCtx.botInstance != cmdName) throw Error("...");
    },
    // registerCommands(cmdName) {
    //   composer.on("message:text", async (ctx) => {
    //     //
    //   });
    //   composer.command(cmdName, _ctx.command);
    //   composer.callbackQuery(_ctx.cbqPattern, _ctx.callbackQuery);
    //   // composer.command(_cmdName, );
    // },
  };

  return _ctx;
};
export const formField = <T extends string>(field: T, title?: string) => {
  return {
    field,
    title,
  } as const;
};
export type FieldTypes2<T extends readonly { field: string }[]> =
  T[number]["field"];

interface ListHelperProps<T> {
  list: T[];
  ctx;
  renderList: (data: T, keyboard: InlineKeyboard) => void;
}
export async function listHelper<T>({
  ctx,
  list,
  renderList,
}: ListHelperProps<T>) {
  const ls = new InlineKeyboard();
  if (list.length) {
    list.map((l) => renderList(l, ls));
    await ctx.reply("Result:", {
      reply_markup: ls,
    });
  } else {
    await ctx.reply(`Empty list`);
  }
}
