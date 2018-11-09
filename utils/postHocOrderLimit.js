const _ = require('lodash');

module.exports = (data, args) => {
  let retData = _.cloneDeep(data);
  if (args.filter) {
    for (const filter of args.filter) {
      if (filter.value.eq && filter.value.eq === '$NULL') {
        retData = retData.filter(
          (d) => d[filter.field] === null || d[filter.field] === undefined,
        );
      } else if (_.isObject(filter.value) && filter.value.not) {
        if (filter.value.not === '$NULL') {
          retData = retData.filter(
            (d) => d[filter.field] !== null && d[filter.field] !== undefined,
          );
        } else {
          retData = retData.filter((d) => d[filter.field] !== filter.value.not);
        }
      } else {
        retData = retData.filter((d) => d[filter.field] === filter.value.eq);
      }
    }
  }
  if (args.orderBy) {
    const order =
      args.order && args.order.toLowerCase() === 'desc' ? 'desc' : 'asc';
    // Always put nils at end by removing from the list, then sorting, then putting them back.
    const [nils, nonNils] = _.partition(retData, (row) =>
      _.isNil(row[args.orderBy]),
    );
    retData = _.orderBy(nonNils, args.orderBy, order).concat(nils);
  }
  if (args.limit) {
    retData = retData.slice(0, args.limit);
  }
  return retData;
};
