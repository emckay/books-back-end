const {ApolloServer} = require('apollo-server-express');
const express = require('express');
const createContext = require('./server/createContext');
const {resolvers, schema} = require('./resolvers');
const cors = require('cors');

const PORT = process.env.PORT || 3333;

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  playground:
    process.env.NODE_ENV === 'production'
      ? false
      : {
          settings: {'editor.cursorShape': 'line'},
        },
  context: createContext,
});

const app = express();
const corsOptions = {
  origin: process.env.CORS_ORIGIN || true,
};
app.use(cors(corsOptions));
app.options('/graphql', cors(corsOptions));
server.applyMiddleware({app});

app.listen(
  PORT,
  () => console.log(`API Server is now running on http://localhost:${PORT}`), // eslint-disable-line no-console
);
