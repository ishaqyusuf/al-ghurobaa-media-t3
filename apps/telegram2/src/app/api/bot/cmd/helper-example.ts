import { InlineKeyboard } from "grammy";

interface ListHelperProps<T> {
  list: T[];
  ctx;
  renderList: (data: T, keyboard: typeof InlineKeyboard) => any;
}
export async function listHelper<T>({
  ctx,
  list,
  renderList,
}: ListHelperProps<T>) {
  const ls = new InlineKeyboard();
  if (list.length) {
    await ctx.reply({
      reply_markup: ls,
    });
  } else {
    await ctx.reply(`Empty list`);
  }
}

interface ActionType {
  input(title: string);
}
interface StoryItem {
  title: string;
  key: string;
  action: (ctx: any) => Promise<any>;
}
type StoryTitles<T extends StoryItem[]> = T[number]["title"];
interface CreateForm<T extends StoryItem[]> {
  onCreate: (ctx, data) => Promise<any>;
  story: (builder: StoryBuilder) => T[]; //StoryItem[];
  actions: {
    title: StoryTitles<T>;
    action;
  }[];
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
        const { data } = await list();
        await ctx.reply(title);
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
  onCreate,
  story,
}: CreateForm<T>) => {
  let form = {};
  let formIndex = 0;
  let formKey = null;
  const _stories = story(storyBuilder) as T;
  async function nextFormAction(ctx) {
    const _story = _stories[formIndex];
    if (_story) {
      await _story.action(ctx, compileAction(ctx));
      formIndex++;
      formKey = _story.key;
    } else {
      await onCreate(ctx, form);
    }
  }
  async function initialize(ctx) {
    form = {};
    formIndex = 0;
    await nextFormAction(ctx);
  }
  async function callback(ctx) {
    const data = ctx.callbackQuery.data;
  }
  return {
    cmds: {
      init: initialize,
      callback,
    },
  };
};
