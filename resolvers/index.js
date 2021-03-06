const {gql} = require('apollo-server-express');
const {
  resolvers: authorResolvers,
  schema: authorSchema,
} = require('./authorResolvers');
const {
  resolvers: bookResolvers,
  schema: bookSchema,
} = require('./bookResolvers');
const {
  resolvers: queryResolvers,
  schema: querySchema,
} = require('./queryResolvers');
const {
  resolvers: readingResolvers,
  schema: readingSchema,
} = require('./readingResolvers');
const {
  resolvers: dayAggregateResolvers,
  schema: dayAggregateSchema,
} = require('./dayAggregateResolvers');

module.exports.resolvers = {
  Author: authorResolvers,
  Book: bookResolvers,
  Query: queryResolvers,
  Reading: readingResolvers,
  DayAggregate: dayAggregateResolvers,
};

module.exports.schema = gql`
  ${authorSchema}
  ${bookSchema}
  ${querySchema}
  ${readingSchema}
  ${dayAggregateSchema}
`;
