import { Composer } from "grammy";

import addAudioToAlbum from "./forms/add-audio-to-album";
import createAlbumComposer from "./forms/create-album";
import createAuthor from "./forms/create-author";
import openAlbumForImportComposer from "./forms/open-album-for-import";

const composer = new Composer();

composer
  .use(createAuthor)
  .use(addAudioToAlbum)
  .use(openAlbumForImportComposer)
  .use(createAlbumComposer);

export default composer;
