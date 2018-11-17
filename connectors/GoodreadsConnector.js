const fetch = require('node-fetch');
const DataLoader = require('dataloader');

const API_KEY = process.env.GOODREADS_API_KEY;
const GOODREADS_REVIEW_COUNTS_ENDPOINT =
  'https://www.goodreads.com/book/review_counts.json';

class GoodreadsConnector {
  constructor(cache) {
    this.cache = cache;
    this.reviewCountsLoader = new DataLoader(this.batchLoadRatings.bind(this), {
      batch: true,
      maxBatchSize: 1000,
      cache: true,
    });
  }

  async batchLoadRatings(isbns) {
    const cleanedIsbns = isbns.map((str) => str.trim());
    // Check for application cache hits.
    let needsFetching = false;
    const cachedValues = cleanedIsbns.map((isbn) => {
      const value = this.cache.get(`goodreads:ratings:${isbn}`);
      if (!value) {
        needsFetching = true;
      }
      return value;
    });
    if (!needsFetching) {
      return cachedValues;
    }
    // Need to fetch some of the requested isbns... might as well get all of them.
    const uri = `${GOODREADS_REVIEW_COUNTS_ENDPOINT}?key=${API_KEY}&isbns=${cleanedIsbns.join(
      '%2C',
    )}`;
    const result = await fetch(uri).then((res) => res.json());
    const data = cleanedIsbns.map((isbn) => {
      const book = result.books.find((book) => book.isbn === isbn);
      if (!book) {
        console.warn('GoodreadsConnector could not find book with isbn', isbn);
        return {
          count: null,
          average: null,
        };
      }
      return {
        count: book.work_ratings_count,
        average: book.average_rating,
      };
    });
    for (let i = 0; i < data.length; i += 1) {
      this.cache.set(
        `goodreads:ratings:${cleanedIsbns[i]}`,
        data[i],
        24 * 60 * 60,
      );
    }
    return data;
  }

  async getRatingsAvg(isbn) {
    const data = await this.reviewCountsLoader.load(isbn);
    return data.average;
  }

  async getRatingsCount(isbn) {
    const data = await this.reviewCountsLoader.load(isbn);
    return data.count;
  }

  async getAllRatingsAvgs(isbns) {
    return await Promise.all(
      isbns.map(
        async (isbn) => (await this.reviewCountsLoader.load(isbn)).average,
      ),
    );
  }

  async getAllRatingsCounts(isbns) {
    return await Promise.all(
      isbns.map(
        async (isbn) => (await this.reviewCountsLoader.load(isbn)).count,
      ),
    );
  }
}

module.exports = GoodreadsConnector;
