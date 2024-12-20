import { InlineKeyboard } from "grammy";

import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { MediaAuthor } from "@acme/db/schema";

export const authorCmds = [
  "/create_author",
  "/list_author",
  "/delete_author",
] as const;
const callbacks = {
  async createAuthor(ctx) {
    const val = ctx.callbackQuery.data;
    session[formKey] = transformCreateAuthorInput(val);
    await nextAuthorFormAction(ctx);
  },
  async deleteAuthor(ctx) {
    const [d, id] = ctx.callbackQuery.data?.split("_");
    await db.delete(MediaAuthor).where(eq(MediaAuthor.id, id));
    await ctx.reply("Deleted");
  },
};
export const authorCmdFns: {
  [id in (typeof authorCmds)[number]]: {};
} = {
  "/create_author": {
    init: createAuthor,
    callback: callbacks.createAuthor,
    text: onText,
  },
  "/list_author": {
    init: listAuthor,
  },
  "/delete_author": {
    init: initDeleteAuthor,
    callback: callbacks.deleteAuthor,
  },
};

async function initDeleteAuthor(ctx) {
  const texts = new InlineKeyboard();
  const authors = await db.query.MediaAuthor.findMany({
    with: {},
  });
  if (authors.length) {
    authors.map((a, i) => {
      texts.text(`${a.name}`, `delete_${a.id}`);
    });
    await ctx.reply("Select Author to delete:", {
      reply_markup: texts,
    });
  } else {
    await ctx.reply("No authors");
  }
}
async function listAuthor(ctx) {
  const texts = new InlineKeyboard();
  const authors = await db.query.MediaAuthor.findMany({
    with: {},
  });
  if (authors.length) {
    authors.map((a, i) => {
      texts.text(`${a.name}`);
    });
    await ctx.reply("Authors", {
      reply_markup: texts,
    });
  } else {
    await ctx.reply("No authors");
  }
}
let session = null;
let formKey = null;

const formStory = {
  authorName: async (ctx) => {
    await ctx.reply("Author Name:");
  },
  displayName: async (ctx) => {
    await ctx.reply("Display Name:");
  },
};
const createAuthorFormStory = [
  { key: "name", action: formStory.authorName },
  { key: "displayName", action: formStory.displayName },
];
const authorFormKeys = ["name"] as const;
let createAuthorFormIndex = 0;
async function nextAuthorFormAction(ctx) {
  const sto = createAuthorFormStory[createAuthorFormIndex];
  if (sto) {
    await sto.action(ctx);
    formKey = sto.key;
    createAuthorFormIndex++;
  } else {
    await saveAuthorData(ctx);
  }
}
async function saveAuthorData(ctx) {
  await ctx.reply("saving...");
  await db.insert(MediaAuthor).values({
    name: session.name,
    meta: {},
  });
  await ctx.reply("Author created");
}
async function createAuthor(ctx) {
  session = {};
  createAuthorFormIndex = 0;
  await nextAuthorFormAction(ctx);
}

async function onText(ctx) {
  const val = ctx.message.text;
  session[formKey] = transformCreateAuthorInput(val);
  await nextAuthorFormAction(ctx);
}
type AuthorFormKeys = (typeof authorFormKeys)[number];

function transformCreateAuthorInput(value) {
  const k: AuthorFormKeys = formKey;
  //   switch (k) {
  //     case "name":
  //       value = value;
  //       break;
  //   }
  return value;
}
