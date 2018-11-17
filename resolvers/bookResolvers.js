const {gql} = require('apollo-server-express');
const _ = require('lodash');

module.exports.schema = gql`
  type Book {
    isbn: String! @unique
    title: String!
    goodreadsRatingsAvg: Float
    goodreadsRatingsAvgPercentile: Float
    goodreadsRatingsCount: Int
    goodreadsRatingsCountPercentile: Float
    estimatedLength: Float
    estimatedLengthPercentile: Float
    authors: [Author!]
    readings: [Reading!]!
    ratingsAvg: Float
  }
`;

module.exports.resolvers = {
  isbn: _.property('isbn'),
  title: _.property('title'),
  estimatedLength: _.property('estimatedLength'),
  estimatedLengthPercentile: _.property('estimatedLengthPercentile'),
  goodreadsRatingsAvg: (obj, args, context) =>
    context.goodreadsConnector.getRatingsAvg(obj.isbn),
  goodreadsRatingsAvgPercentile: async (obj, args, context) => {
    const reading = await context.googleSheetsConnector.loadReadingsByBook(
      obj.isbn,
    );
    return reading[0].goodreadsRatingsAvgPercentile;
  },
  goodreadsRatingsCount: (obj, args, context) =>
    context.goodreadsConnector.getRatingsCount(obj.isbn),
  goodreadsRatingsCountPercentile: async (obj, args, context) => {
    const reading = await context.googleSheetsConnector.loadReadingsByBook(
      obj.isbn,
    );
    return reading[0].goodreadsRatingsCountPercentile;
  },
  authors: (obj, args, context) =>
    context.googleSheetsConnector.loadAuthorsByBook(obj.isbn),
  ratingsAvg: async (obj, args, context) => {
    const readings = await context.googleSheetsConnector.loadReadingsByBook(
      obj.isbn,
    );
    return _.mean(readings.map((r) => r.rating));
  },
  readings: async (obj, args, context) => {
    return context.googleSheetsConnector.loadReadingsByBook(obj.isbn);
  },
};
