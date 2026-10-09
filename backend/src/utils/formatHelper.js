/**
 * Helper to ensure both `id` and `_id` are available on returned objects
 * for full backward compatibility across frontend components and API consumers.
 */
export const formatEntity = (entity) => {
  if (!entity) return entity;
  if (Array.isArray(entity)) return entity.map(formatEntity);
  if (entity instanceof Date) return entity;
  if (typeof entity === 'object' && entity !== null) {
    const formatted = { ...entity };
    if (formatted.id && !formatted._id) {
      formatted._id = formatted.id;
    }
    for (const key of Object.keys(formatted)) {
      if (
        formatted[key] &&
        typeof formatted[key] === 'object' &&
        !(formatted[key] instanceof Date)
      ) {
        formatted[key] = formatEntity(formatted[key]);
      }
    }
    return formatted;
  }
  return entity;
};
