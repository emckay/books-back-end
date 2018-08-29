const _ = require('lodash');
const {gql} = require('apollo-server-express');

module.exports.schema = gql`
  type Author {
    name: String!
    books: [Book!]!
    readings: [Reading!]!
    readingsCount: Int
    ratingsAvg: Float
  }
`;

module.exports.resolvers = {
  name: _.property('name'),
  readings: (obj, args, context) =>
    context.googleSheetsConnector.loadReadingsByAuthor(obj.name),
  readingsCount: async (obj, args, context) => {
    const readings = await context.googleSheetsConnector.loadReadingsByAuthor(
      obj.name,
    );
    return readings.length;
  },
  ratingsAvg: async (obj, args, context) => {
    const readings = await context.googleSheetsConnector.loadReadingsByAuthor(
      obj.name,
    );
    return _.mean(readings.map((r) => r.rating));
  },
  books: async (obj, args, context) => {
    const books = await context.googleSheetsConnector.loadBooksByAuthor(
      obj.name,
    );
    return _.uniqBy(books, 'isbn10');
  },
};
