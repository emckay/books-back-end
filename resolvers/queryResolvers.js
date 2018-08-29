const {gql} = require('apollo-server-express');
const postHocOrderLimit = require('../utils/postHocOrderLimit');

module.exports.schema = gql`
  input FilterValueObject {
    not: String
    eq: String
  }
  input Filter {
    field: String!
    value: FilterValueObject
  }
  type Query {
    readings(
      orderBy: String
      order: String
      limit: Int
      filter: [Filter]
    ): [Reading!]!
    books(orderBy: String, order: String, limit: Int): [Book!]!
    book(isbn: String!): Book!
  }
`;

module.exports.resolvers = {
  book: (parent, args, context) =>
    context.googleSheetsConnector.loadBook(args.isbn),
  async books(parent, args, context) {
    const data = await context.googleSheetsConnector.loadBooks();
    return postHocOrderLimit(data, args);
  },
  async readings(parent, args, context) {
    const data = await context.googleSheetsConnector.loadReadings();
    return postHocOrderLimit(data, args);
  },
};
