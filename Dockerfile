FROM debian:jessie

RUN apt-get update \
    && apt-get install -y libreoffice curl python python-pip \
    && apt-get clean \
    && pip install xlsx2csv

# 都道府県コード及び市区町村コード
# 令和元年5月1日現在
# http://www.soumu.go.jp/denshijiti/code.html
# (No English page available)
#
# `tail -n +6` means skipping the first 5 lines (kind of header information)
RUN curl -o target.xls http://www.soumu.go.jp/main_content/000618153.xls \
    && libreoffice --headless \
        --convert-to xlsx \
        ./target.xls \
    && mkdir /data \
    && xlsx2csv --sheet 1 target.xlsx /tmp/regular_cities.csv \
    && tail -n +6 /tmp/regular_cities.csv > /data/regular_cities.csv \
    && xlsx2csv --sheet 2 target.xlsx /data/shitei_toshi.csv
