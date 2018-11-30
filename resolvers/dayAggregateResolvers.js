const {gql} = require('apollo-server-express');
const _ = require('lodash');

module.exports.schema = gql`
  type DayAggregate {
    date: String! @unique
    amountRead: Float!
    isbns: [String]!
    readings: [Reading]!
  }
`;

module.exports.resolvers = {
  date: (obj) => obj.date.toISOString().substring(0, 10),
  amountRead: (obj) =>
    obj.readings.reduce(
      (a, r) => (_.isNumber(r.amountPerDay) ? a + r.amountPerDay : a),
      0,
    ),
  isbns: (obj) => obj.readings.map((r) => r.bookIsbn),
  readings: _.property('readings'),
};
