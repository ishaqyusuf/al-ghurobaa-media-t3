export async function nextId(model, where?) {
  return (await lastId(model, where)) + 1;
}
export async function lastId(model, _default = 0, where?) {
  return ((
    await model.findFirst({
      where: {
        deletedAt: undefined,
        ...(where || {}),
      },
      orderBy: {
        id: "desc",
      },
    })
  )?.id || _default) as number;
}
export function formatSize(fileSize, def?) {
  if (!fileSize) return undefined;
  return fileSize / 1_048_576;
}
export function containsOnlyEnglish(text) {
  const englishRegex = /^[A-Za-z\s]+$/; // Matches only English letters and spaces
  return englishRegex.test(text);
}
export function generateRandomString(length = 15) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset.charAt(randomIndex);
  }

  return randomString;
}
