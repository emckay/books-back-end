const NodeCache = require('node-cache');
const GoogleSheetsConnector = require('../connectors/GoogleSheetsConnector');
const GoodreadsConnector = require('../connectors/GoodreadsConnector');

const cache = new NodeCache();

module.exports = () => {
  const goodreadsConnector = new GoodreadsConnector(cache);
  const googleSheetsConnector = new GoogleSheetsConnector(
    cache,
    goodreadsConnector,
  );
  return {
    googleSheetsConnector,
    goodreadsConnector,
  };
};
