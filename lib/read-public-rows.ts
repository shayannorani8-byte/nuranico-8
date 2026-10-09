/** Read all rows in stable order without relying on the Supabase default row limit. */
export async function readPublicRows<T>(
  query: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: unknown }>,
) {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 1000) {
    const result = await query(offset, offset + 999);
    if (result.error) return { data: rows, error: result.error };
    rows.push(...(result.data || []));
    if ((result.data || []).length < 1000) return { data: rows, error: null };
  }
}
