#!/bin/sh
echo "id,prefecture_id,prefecture_en,prefecture_ja" > /app/build/prefectures.csv
node /app/prefecture.js /data/regular_cities.csv >> /app/build/prefectures.csv
wc -l /app/build/prefectures.csv

node /app/app.js /data/shitei_toshi.csv /data/regular_cities.csv \
    | sort > /data/regular_cities.sorted.csv
echo "id,prefecture_id,city_en,city_ja,special_district_ja" > /app/build/cities_in_japan_2016.csv
cat /data/regular_cities.sorted.csv >> /app/build/cities_in_japan_2016.csv
wc -l /app/build/cities_in_japan_2016.csv