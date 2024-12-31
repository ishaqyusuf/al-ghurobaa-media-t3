import { RouterOutputs } from "..";
import { BlogQueryDta } from "../data-access/blog-dta";
import { AlbumType, BlogType } from "../type";

export function blogDto(blog: BlogQueryDta[number]) {
  const type: BlogType = blog.type as any;
  return {
    type,
    id: blog.id,
    content: blogContent(type, blog.content),
    caption: blogCaption(type, blog.content),
    date: blog.blogDate,
    audio: blogAudio(type, blog),
    video: blogVideo(type, blog),
    img: blogImg(type, blog),
    doc: blogPdf(type, blog),
  };
}
function blogPdf(type: BlogType, blog: BlogQueryDta[number]) {
  if (type == "pdf") {
  }
  return null;
}
function blogVideo(type: BlogType, blog: BlogQueryDta[number]) {
  if (type == "video") {
  }
  return null;
}
function blogImg(type: BlogType, blog: BlogQueryDta[number]) {
  if (type == "image") {
  }
  return null;
}
function blogAudio(type: BlogType, blog: BlogQueryDta[number]) {
  if (type == "audio") {
    const [media] = blog.medias;
    if (!media || !media.file) return null;
    let displayName = media.file?.fileName;

    if (media.album) {
      const albumType = media.album.albumType as AlbumType;
      if (albumType == "series") {
        displayName = [
          `${media.album.name}
                ${media.albumAudioIndex?.index}`,
        ]
          .filter(Boolean)
          .join(" - ");
      }
    }
    return {
      title: media.title,
      mediaId: media.id,
      telegramFileId: media.file.fileId,
      fileName: media.file?.fileName,
      displayName,
      size: media.file.fileSize,
      duration: media.file.duration,
      authorId: media.album?.albumAuthorId || media.authorId,
      authorName: media.album?.author?.name || media.author?.name,
      albumName: media.album?.name,
      albumId: media.albumId,
    };
  }
  return null;
}
function blogContent(type: BlogType, content) {
  if (type == "text") return content;
  return null;
}
function blogCaption(type: BlogType, content) {
  if (type == "text") return null;
  return content;
}
