const rp = require('request-promise-native')
const fs = require('fs')
const csv = require('csv')
const { Transform } = require('stream')

const LANGLINKS_SERVER_ENDPOINT = process.env.LANGLINKS_SERVER_ENDPOINT
  ? process.env.LANGLINKS_SERVER_ENDPOINT : 'http://localhost:8080'

// See regular_cities.csv
const transformPrefecture = csv.transform((record) => {
  if (record[2]) {
    return null
  }
  return {
    // See outputColumns() in app.js
    id: record[0].substr(0, 5),
    prefecture_id: record[0].substr(0, 2),
    prefecture_en: null,
    prefecture_ja: record[1]
  }
})

const addLangLinks = () => {
  const transformer = new Transform({ objectMode: true })
  transformer._transform = (record, encoding, callback) => {
    rp({
      uri: LANGLINKS_SERVER_ENDPOINT + '/search/' + encodeURIComponent(record.prefecture_ja),
      json: true
    })
      .then((data) => {
        if (!data.en) throw new Error('city name in English not found')
        record.prefecture_en = data.en
        callback(null, record)
      })
      .catch((reason) => {
        console.error(reason)
      })
  }
  return transformer
}

const fixErrors = () => {
  const transformer = new Transform({ objectMode: true })
  transformer._transform = (record, encoding, callback) => {
    // Wikipedia has a wrong link
    if (record.prefecture_ja === '熊本県') {
      record.prefecture_en = 'Kumamoto Prefecture'
    }
    callback(null, record)
  }
  return transformer
}

const output = process.argv[3] ? fs.createWriteStream(process.argv[3]) : process.stdout

fs.createReadStream(process.argv[2])
  .pipe(csv.parse())
  .pipe(transformPrefecture)
  .pipe(addLangLinks())
  .pipe(fixErrors())
  .pipe(csv.stringify())
  .pipe(output)
