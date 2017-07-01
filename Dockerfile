FROM debian:jessie

RUN apt-get update
RUN apt-get install -y libreoffice
RUN apt-get install -y curl
RUN apt-get install -y python python-pip

RUN pip install xlsx2csv


# 都道府県コード及び市区町村コード
# 平成28年10月10日現在
# http://www.soumu.go.jp/denshijiti/code.html
# (No English page available)
RUN curl -O http://www.soumu.go.jp/main_content/000442937.xls

RUN libreoffice --headless \
    --convert-to xlsx \
    ./000442937.xls

RUN mkdir /data
RUN xlsx2csv --sheet 1 000442937.xlsx /tmp/regular_cities.csv
# Skip the first 5 lines (kind of header information)
RUN tail -n +6 /tmp/regular_cities.csv > /data/regular_cities.csv
RUN xlsx2csv --sheet 2 000442937.xlsx /data/shitei_toshi.csv