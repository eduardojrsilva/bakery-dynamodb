function normalizeResponse(item) {
  const allKeys = Object.keys(item);

  const filteredKeys = allKeys.filter((key) => {
    const isPrimaryKey = ['_pk', '_sk'].some((suffix) => key.endsWith(suffix));
    const isActiveFlag = key === 'active';

    return !isPrimaryKey && !isActiveFlag;
  });

  const filteredObject = filteredKeys.reduce((acc, key) => ({
    ...acc,
    [key]: item[key]
  }), {});

  return filteredObject;
}

module.exports = { normalizeResponse };