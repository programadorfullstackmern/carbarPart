export const parseSort = (sortStr) => {
  if (!sortStr) return {};
  return sortStr.split(',').reduce((acc, field) => {
    const order = field.startsWith('-') ? -1 : 1;
    const cleanField = field.replace(/^-/, '');
    return { ...acc, [cleanField]: order };
  }, {});
};

export const parseNumericFilters = (query, fields) => {
  fields.forEach(({field, min, max}) => {
    if (min || max) {
      query[field] = {};
      if (min) query[field].$gte = Number(min);
      if (max) query[field].$lte = Number(max);
    }
  });
};