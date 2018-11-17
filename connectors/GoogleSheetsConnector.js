global.fetch = require('node-fetch'); // needed for GetSheetDone
const GetSheetDone = require('get-sheet-done-3');
const _ = require('lodash');
const {addPercentileRanks} = require('../utils/percentileRank');
const moment = require('moment');
const GoodreadsConnector = require('./GoodreadsConnector');
const percentileRank = require('../utils/percentileRank');

const DOCUMENT_ID =
  process.env.DOCUMENT_ID || '12vA25QPrkHOLTd4nKdUae8habZDdbc0ysTvg6F-fOlE';

const splitAuthorNames = (joinedAuthorNames) =>
  joinedAuthorNames.split(/\s*,\s*/);

const memoizeFunctions = function(functionNames) {
  for (const functionName of functionNames) {
    this[functionName] = _.memoize(this[functionName].bind(this));
  }
};

class GoogleSheetsConnector {
  constructor(cache, goodreadsConnector) {
    this.cache = cache; // application cache
    this.cachedData = null; // caches per request
    this.goodreadsConnector =
      goodreadsConnector || new GoodreadsConnector(this.cache);
    memoizeFunctions.call(this, [
      'loadSpreadsheet',
      'loadReadings',
      'loadBooks',
      'loadBooksByAuthor',
      'loadReadingsByAuthor',
      'loadReadingsByBook',
      'loadBook',
      'loadAuthorsByBook',
    ]);
  }

  async loadSpreadsheet() {
    if (!this.cachedData) {
      const cachedData = this.cache.get('sheetData');
      if (cachedData) {
        this.cachedData = cachedData;
      } else {
        const data = (await GetSheetDone.labeledCols(DOCUMENT_ID)).data
          .filter((row) => row.isbn10)
          .map((row) => _.mapValues(row, (v) => (v === '' ? null : v)));
        this.cachedData = data;
        this.cache.set('sheetData', this.cachedData, 30);
      }
    }
    return this.cachedData;
  }

  async loadReadings() {
    const spreadsheet = await this.loadSpreadsheet();
    let readings = spreadsheet.map((row) => {
      const startDate = row.startdate
        ? moment(row.startdate, 'MM/DD/YYYY').toDate()
        : null;
      const endDate = row.enddate
        ? moment(row.enddate, 'MM/DD/YYYY').toDate()
        : null;
      const length = row.estimatedkindlelength
        ? parseFloat(row.estimatedkindlelength)
        : null;
      let days;
      if (startDate && endDate) {
        days = moment(endDate).diff(moment(startDate), 'days') + 1;
      }
      return {
        startDate: moment(startDate).toISOString(),
        endDate: moment(endDate).toISOString(),
        rating: row.rating ? parseFloat(row.rating) : null,
        audio: row.audio === '1' || row.audio === 1,
        bookIsbn: row.isbn10,
        finished: row.finished,
        authorNames: splitAuthorNames(row.author).filter((name) => name),
        amountPerDay: length && days ? length / days : null,
        daysToFinish: days,
      };
    });
    const goodreadsRatingsAvgs = await this.goodreadsConnector.getAllRatingsAvgs(
      _.uniq(readings.map((r) => r.bookIsbn)),
    );
    const goodreadsRatingsCounts = await this.goodreadsConnector.getAllRatingsCounts(
      _.uniq(readings.map((r) => r.bookIsbn)),
    );
    readings = addPercentileRanks(readings, [
      'rating',
      'amountPerDay',
      'daysToFinish',
    ]);
    readings = await Promise.all(
      readings.map(async (r) => {
        const goodreadsRatingsAvgPercentile = percentileRank(
          goodreadsRatingsAvgs,
          await this.goodreadsConnector.getRatingsAvg(r.bookIsbn),
        );
        const goodreadsRatingsCountPercentile = percentileRank(
          goodreadsRatingsCounts,
          await this.goodreadsConnector.getRatingsCount(r.bookIsbn),
        );
        return Object.assign({}, r, {
          goodreadsRatingsAvgPercentile,
          goodreadsRatingsCountPercentile,
          contrariness:
            r.rating !== null && r.rating !== undefined
              ? r.ratingPercentile - goodreadsRatingsAvgPercentile
              : null,
          contrarinessAbs:
            r.rating !== null && r.rating !== undefined
              ? Math.abs(r.ratingPercentile - goodreadsRatingsAvgPercentile)
              : null,
        });
      }),
    );
    readings = addPercentileRanks(readings, [
      'contrariness',
      'contrarinessAbs',
    ]);

    return readings;
  }

  async loadBooks() {
    const spreadsheet = await this.loadSpreadsheet();
    const books = _.uniqBy(
      spreadsheet.map((row) => ({
        isbn: row.isbn10,
        title: row.title,
        estimatedLength: parseInt(row.estimatedkindlelength, 10),
        authorNames: splitAuthorNames(row.author).filter((name) => name),
      })),
      'isbn',
    );
    return addPercentileRanks(books, ['estimatedLength']);
  }

  async loadBooksByAuthor(authorName) {
    const books = await this.loadBooks();
    return books.filter((b) => b.authorNames.includes(authorName));
  }

  async loadReadingsByAuthor(authorName) {
    const readings = await this.loadReadings();
    return readings.filter((r) => r.authorNames.includes(authorName));
  }

  async loadReadingsByBook(isbn) {
    const readings = await this.loadReadings();
    return readings.filter((r) => r.bookIsbn === isbn);
  }

  async loadBook(isbn) {
    const books = await this.loadBooks();
    return books.find((b) => b.isbn === isbn);
  }

  async loadAuthorsByBook(isbn) {
    const book = await this.loadBook(isbn);
    return book.authorNames.map((a) => ({
      name: a,
    }));
  }
}

module.exports = GoogleSheetsConnector;
