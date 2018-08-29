const {gql} = require('apollo-server-express');
const _ = require('lodash');

module.exports.schema = gql`
  type Reading {
    id: ID! @unique
    book: Book!
    startDate: String
    endDate: String
    amountPerDay: Float
    amountPerDayPercentile: Float
    rating: Float
    ratingPercentile: Float
    audio: Boolean
    contrariness: Float
    contrarinessPercentile: Float
    contrarinessAbs: Float
    contrarinessAbsPercentile: Float
  }
`;

module.exports.resolvers = {
  startDate: _.property('startDate'),
  endDate: _.property('endDate'),
  rating: _.property('rating'),
  ratingPercentile: _.property('ratingPercentile'),
  audio: _.property('audio'),
  amountPerDay: _.property('amountPerDay'),
  contrariness: _.property('contrariness'),
  contrarinessPercentile: _.property('contrarinessPercentile'),
  contrarinessAbs: _.property('contrarinessAbs'),
  contrarinessAbsPercentile: _.property('contrarinessAbsPercentile'),
  book: (obj, args, context) =>
    context.googleSheetsConnector.loadBook(obj.bookIsbn),
};
