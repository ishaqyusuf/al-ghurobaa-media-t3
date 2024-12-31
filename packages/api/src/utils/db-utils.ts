export async function getNextCursor(table, params) {
  const { limit, cursor } = params;
  const offset = cursor * limit;
  const totalPosts = await table.count({});
  if (!totalPosts) throw new Error();

  const hasNextPage = offset + limit < totalPosts;
  const nextCursor = hasNextPage ? offset + limit : null;
  return nextCursor;
}
