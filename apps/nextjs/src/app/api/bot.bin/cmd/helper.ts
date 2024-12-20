import { InlineKeyboard } from "grammy";

// import { InlineKeyboard as IInlineKeyboard } from "grammy/types";

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

interface ActionType {
  input(title: string);
}
interface StoryItem<T extends string> {
  title: string;
  key: T;
  action: (ctx: any) => Promise<any>;
}
type StoryTitles<T extends StoryItem[]> = T[number]["key"];
type Transform<T extends StoryItem[]> = {
  [id in StoryTitles<T>]: (value, form, mode) => any;
};
interface CreateForm<T extends StoryItem[]> {
  onCompleted: (ctx, data) => Promise<any>;
  story: (builder: StoryBuilder) => T[]; //StoryItem[];
  //   actions: {
  //     title: StoryTitles<T>;
  //     action;
  //   }[];
  transform?: Transform<StoryItem[]>;
}

const storyBuilder = {
  textInput(title, key) {
    return {
      title,
      key,
      action: async (ctx) => {
        await ctx.reply(title);
      },
    };
  },
  selectInput<T>(
    title,
    key,
    list: () => Promise<{
      data: T[];
      renderList(keyboard: typeof InlineKeyboard, item: T);
    }>,
  ) {
    return {
      title,
      key,
      action: async (ctx) => {
        const texts = new InlineKeyboard();
        const { data, renderList } = await list();
        await ctx.reply(title);
        data.map((item) => renderList(texts, item));
        if (data.length)
          await ctx.reply("Suggestions:", {
            reply_markup: texts,
          });
      },
    };
  },
};
type StoryBuilder = typeof storyBuilder;
function compileAction(ctx) {
  const _actions: ActionType = {
    async input(title) {
      await ctx.reply(title);
    },
  };
  return _actions;
}
export const createForm = <T extends StoryItem>({
  onCompleted,
  story,
  transform,
}: CreateForm<T>) => {
  let form = {};
  let formIndex = 0;
  let formKey: any = null;
  const _stories = story(storyBuilder);
  async function nextFormAction(ctx) {
    const _story = _stories[formIndex];
    console.log({ stories: _stories.length });
    if (_story) {
      await _story.action(ctx, compileAction(ctx));
      formIndex++;
      console.log({ formIndex });
      formKey = _story.key;
    } else {
      await onCompleted(ctx, form);
    }
  }
  async function initialize(ctx) {
    form = {};
    formIndex = 0;
    await nextFormAction(ctx);
  }
  async function saveFormData(ctx, value, mode: "text" | "btn") {
    if (!formKey) {
      await ctx.reply("Unknown form data");
      return;
    }
    const transformer = transform?.[formKey];
    if (transformer) {
      try {
        value = transformer(value, form, mode);
      } catch (error) {
        await ctx.reply("Value not accepted try again");
        return;
      }
    }
    form[formKey] = value;
    await nextFormAction(ctx);
  }
  async function callback(ctx) {
    const data = ctx.callbackQuery.data;
    await saveFormData(ctx, data, "btn");
  }
  async function onText(ctx) {
    const data = ctx.message.text;
    await saveFormData(ctx, data, "text");
  }
  return {
    cmds: {
      init: initialize,
      callback,
      text: onText,
    },
  };
};
