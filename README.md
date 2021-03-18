# Benchmark Inlux DB

Using `Amazon Linux 2` (arm) on t4g.2xlarge. **Warning: you might want to increase the volume size when generating larger sized data for benchmarks.**

Install dependencies first:

```sh
sudo yum install -y golang git wget curl
```

## Install Time Series Benchmark Suite (TSBS)

Install all binaries as per instructions [from tsbs GitHub page](https://github.com/timescale/tsbs#installation)

```sh
go get github.com/timescale/tsbs
cd go/src/github.com/timescale/tsbs/cmd
go get ./...
go install ./...
```

## Generate Data

```sh
export PATH=~/go/bin:$PATH
tsbs_generate_data --use-case="devops" --seed=42 --scale=400 --timestamp-start="2021-01-01T00:00:00Z" --timestamp-end="2021-01-02T00:00:00Z" --log-interval="10s" --format="influx" | gzip > /tmp/influx-data.gz
```

## Load Data

```sh
cat /tmp/influx-data.gz | gunzip | tsbs_load_timescaledb --user 'admin' --pass 'YouShouldNotDoThis!' --workers 2 --batch-size 10000
```