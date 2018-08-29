# Book Analytics Back-end

This is a personal project that I used to learn GraphQL.

This is the back-end application code that uses GraphQL, Apollo Server, and the [Goodreads api](https://www.goodreads.com/api) to display some information about the books I am reading.

The front-end ReactJS application is available [here](https://www.github.com/emckay/books-front-end).

The data store for this application is a [Google spreadsheet](https://docs.google.com/spreadsheets/d/12vA25QPrkHOLTd4nKdUae8habZDdbc0ysTvg6F-fOlE/edit#gid=0) that I use to track the books I read. The public version is automatically generated from a private version. If you want to create a similar spreadsheet, let me know and I can provide you with the necessary functions.

## Development

```
git clone git@github.com:emckay/books-back-end.git
cd books-back-end
yarn
```

While packages are installing, get a [Goodreads api key](https://www.goodreads.com/api/keys).

Once everything is done:

```
GOODREADS_API_KEY=xxxxxx yarn dev
```

Here are the environment variables available as options:

|ENV|Description|Default|
|---|---|---|
|PORT|Port to run the server on. GraphQL endpoint will be `http://localhost:{PORT}/graphql`|3333|
|DOCUMENT_ID|The id for the Google spreadsheet with the backend data|Id of my spreadsheet (it's public)|
|CORS_ORIGIN|Only allow requests to the server from this domain|All domains allowed|
|GOODREADS_API_KEY|[Goodreads api key](https://www.goodreads.com/api/keys)|Required|

## Deployment

This application can be deployed directly to Heroku as-is. Please refer to their documentation for instructions.
