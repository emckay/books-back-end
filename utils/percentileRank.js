const _ = require('lodash');

const percentileRank = (array, n) => {
  let L = 0;
  let S = 0;
  const N = array.length;
  for (let i = 0; i < array.length; i++) {
    if (array[i] < n) {
      L += 1;
    } else if (array[i] === n) {
      S += 1;
    }
  }
  const pct = (L + 0.5 * S) / N;
  return pct;
};

module.exports = percentileRank;

const addPercentileRanks = (objects, keys) => {
  const returnedObjects = _.cloneDeep(objects);
  for (const key of keys) {
    const allValues = returnedObjects.map((o) => o[key]).filter((v) => v);
    for (const object of returnedObjects) {
      object[key] !== undefined && object[key] !== null
        ? null
        : console.log('no', key, 'for', object);
      object[`${key}Percentile`] =
        object[key] !== undefined && object[key] !== null
          ? percentileRank(allValues, object[key])
          : null;
    }
  }
  return returnedObjects;
};

module.exports.addPercentileRanks = addPercentileRanks;
