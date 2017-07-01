const rp = require('request-promise-native')
const fs = require('fs')
const csv = require('csv')
const { Transform } = require('stream')

const LANGLINKS_SERVER_ENDPOINT = process.env.LANGLINKS_SERVER_ENDPOINT
  ? process.env.LANGLINKS_SERVER_ENDPOINT : 'http://localhost:8080'

const cityNameAliases = {
  // key: aliases
  // value: name appeared on Wikipedia entry
  '梼原町': '檮原町'
}

const cityName = (input) => {
  const match = input.match(/^(.*?市)/)
  return match ? match[0] : null
}

const specialDistrictName = (input) => {
  const match = input.match(/^.*?市(.+)$/)
  return match ? match[1] : null
}

const transformShiteiToshi = csv.transform((record) => {
  return {
    id: record[0],
    prefecture: null,
    city_en: null,
    city_ja: cityName(record[1]),
    special_district_ja: specialDistrictName(record[1])
  }
})

const skipShiteiToshi = () => {
  const transformer = new Transform({objectMode: true})
  transformer._transform = (record, encoding, callback) => {
    if (!record.special_district_ja) {
      // skip if record has only city name it will be duplicated
      callback(null, null)
    } else {
      callback(null, record)
    }
  }
  return transformer
}

const transformRegularCities = csv.transform((record) => {
  return {
    id: record[0],
    prefecture: record[1],
    city_en: null,
    city_ja: record[2],
    special_district_ja: null
  }
})

const skipPrefecture = () => {
  const transformer = new Transform({objectMode: true})
  transformer._transform = (record, encoding, callback) => {
    if (!record.city_ja) {
      callback(null, null)
    } else {
      callback(null, record)
    }
  }
  return transformer
}

const possibleEntryNames = (record) => {
  let names = []
  if (record.special_district_ja) {
    names.push(record.special_district_ja + '_(' + record.city_ja + ')')
    names.push(record.special_district_ja)
    return names
  }
  if (record.city_ja) {
    names.push(record.city_ja + '_(' + record.prefecture + ')')
    names.push(record.city_ja)
    if (cityNameAliases[record.city_ja]) {
      names.push(cityNameAliases[record.city_ja])
    }
    return names
  }
  names.push(record.prefecture)
  return names
}

const addLangLinks = () => {
  const transformer = new Transform({ objectMode: true })
  transformer._transform = (record, encoding, callback) => {
    const requests = possibleEntryNames(record)
      .map(name => {
        return rp({
          uri: LANGLINKS_SERVER_ENDPOINT + '/search/' + encodeURIComponent(name),
          json: true
        })
      })

    Promise.all(requests)
      .then((responses) => {
        const data = responses.find(data => data.en)
        if (!data) throw new Error('city name in English not found')
        record.city_en = data.en
        callback(null, record)
      })
      .catch((reason) => {
        console.error(reason)
      })
  }
  return transformer
}

const outputColumns = () => {
  const transformer = new Transform({ objectMode: true })
  transformer._transform = (record, encoding, callback) => {
    callback(null, {
      // The last digit is a special digit and the first 5 digits seem
      // commonly being used as ID.
      // See also https://ja.wikipedia.org/wiki/%E5%85%A8%E5%9B%BD%E5%9C%B0%E6%96%B9%E5%85%AC%E5%85%B1%E5%9B%A3%E4%BD%93%E3%82%B3%E3%83%BC%E3%83%89
      id: record.id.substr(0, 5),
      prefecture_id: record.id.substr(0, 2),
      city_en: record.city_en,
      city_ja: record.city_ja,
      special_district_ja: record.special_district_ja
    })
  }
  return transformer
}

const output = process.argv[4] ? fs.createWriteStream(process.argv[4]) : process.stdout

fs.createReadStream(process.argv[2])
  .pipe(csv.parse())
  .pipe(transformShiteiToshi)
  .pipe(skipShiteiToshi())
  .pipe(addLangLinks())
  .pipe(outputColumns())
  .pipe(csv.stringify())
  .pipe(output)

fs.createReadStream(process.argv[3])
  .pipe(csv.parse())
  .pipe(transformRegularCities)
  .pipe(skipPrefecture())
  .pipe(addLangLinks())
  .pipe(outputColumns())
  .pipe(csv.stringify())
  .pipe(output)
