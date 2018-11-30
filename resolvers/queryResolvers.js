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
    dayAggregate(date: String!): DayAggregate!
    dayAggregates(startDate: String!, endDate: String!): [DayAggregate]!
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
  async dayAggregate(parent, args, context) {
    const date = new Date(args.date);
    const allReadings = await context.googleSheetsConnector.loadReadings();
    return {
      date,
      readings: allReadings.filter(
        (reading) =>
          new Date(reading.startDate) <= date &&
          new Date(reading.endDate) >= date,
      ),
    };
  },
  async dayAggregates(parent, args, context) {
    const startDate = new Date(args.startDate);
    const endDate = new Date(args.endDate);
    const allReadings = await context.googleSheetsConnector.loadReadings();
    const dayAggregates = [];
    for (let i = startDate; i <= endDate; i.setDate(i.getDate() + 1)) {
      dayAggregates.push({
        date: new Date(i),
        readings: allReadings.filter(
          (reading) =>
            new Date(reading.startDate) <= i && new Date(reading.endDate) >= i,
        ),
      });
    }
    return dayAggregates;
  },
};
