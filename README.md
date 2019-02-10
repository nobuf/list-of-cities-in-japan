# List of Cities in Japan

A script that generates a list of cities/towns in Japan based on the official [都道府県コード及び市区町村コード](http://www.soumu.go.jp/denshijiti/code.html) version 2018/10/1. It includes English names.

## Build

```shell
docker --version
Docker version 18.09.1, build 4c52b90

docker-compose --version
docker-compose version 1.23.2, build 1110ad01
```

```shell
# https://github.com/nobuf/langlinks-server must be up and running
curl -v http://localhost:8080
#
git clone https://github.com/nobuf/list-of-cities-in-japan.git
cd list-of-cities-in-japan
docker-compose up --build
ls -l build
```

## Download

- [build/prefectures.csv](build/prefectures.csv)
- [build/cities_in_japan_2018.csv](build/cities_in_japan_2018.csv)

## Column Reference

### prefectures.csv

- `id` — 5 digits code that represents the prefecture
- `prefecture_id` — 2 digits version of `id`
- `prefecture_en` — Name in English
- `prefecture_ja` — Name in Japanese

### cities_in_japan_2018.csv

- `id` — 5 digits code that represents the city/town (市区町村)
- `prefecture_id` — 2 digits prefecture ID
- `city_en` — Name in English. The translation comes from Wikipedia data via [langlinks-server](https://github.com/nobuf/langlinks-server). Some names are like "Hakodate, Hokkaido" with its prefecture name while some of them are just "Otaru" without Hokkaido.
- `city_ja` — Name in Japanese.
- `special_district_ja` — [Some big cities](https://en.wikipedia.org/wiki/Cities_designated_by_government_ordinance_of_Japan) have special districts ([特別区](https://ja.wikipedia.org/wiki/%E7%89%B9%E5%88%A5%E5%8C%BA)) within the city.

## Contributing

If you have any ideas let @nobuf know by opening an issue. Pull requests are always welcome.

## License

MIT
