# Command Line Utility for Open Source Cloud

CLI for working and scripting with [Open Source Cloud](www.osaas.io)

Prerequisites:

- Node >18
- An Open Source Cloud account and a Personal Access Token at hand

## Install

```
npm install -g @osaas/cli
```

## Usage

```
% osc
Usage: cli [options] [command]

Options:
  -v, --version                        Output the current version
  --env <environment>                  Environment to use
  -h, --help                           display help for command

Commands:
  admin
  list <serviceId>                     List all my service instances
  create [options] <serviceId> <name>  Create a service instance
  describe <serviceId> <name>          Get details for a service instance
  remove <serviceId> <name>            Remove a service instance
  logs <serviceId> <name>              Get logs for a service instance
  packager [options] <source> <dest>   Create streaming package from ABR bundle on S3
                                       and store on another S3 bucket
  compare
  live
  intercom
  transcribe [options] <source>        Generate subtitles from video or audio using Open
                                       AI Whisper
  db
  architect
  vod
  web
  help [command]                       display help for command
```

## Examples

### List all my channel-engine instances

```
% export OSC_ACCESS_TOKEN=<pat>
% osc list channel-engine
```

### Create a channel from a VOD on loop and insert ad breaks

```
% osc create channel-engine cli -o \
    type=Loop \
    url=https://lab.cdn.eyevinn.technology/stswetvplus-promo-2023-5GBm231Mkz.mov/manifest.m3u8 \
    opts.useDemuxedAudio=false \
    opts.useVttSubtitles=false \
    opts.preroll.url=http://maitv-vod.lab.eyevinn.technology/VINN.mp4/master.m3u8 \
    opts.preroll.duration=10500
```

### Remove a channel-engine instance with name `clidemo`

```
% osc remove channel-engine clidemo
```

### Create ABR files for VOD using SVT Encore

```
osc encore create test s3://lab-testcontent-store/birme/
osc encore transcode https://testcontent.eyevinn.technology/mp4/stswe-tvplus-promo.mp4
```

### Transcode and create streaming package using SVT Encore and Shaka Packager

```
osc pipeline create s3://lab-testcontent-store/birme/output/
osc pipeline transcode https://testcontent.eyevinn.technology/mp4/stswe-tvplus-promo.mp4
```

### Compare two video files using VMAF

```
% osc compare vmaf s3://lab-testcontent-store/birme/snaxax_x264_3100.mp4 \
    s3://lab-testcontent-store/birme/snaxax_x264_324.mp4 \
    s3://lab-testcontent-store/birme/
```

### List all channel-engine instance for tenant `eyevinn` as an OSC super admin

```
PAT_SECRET=<pat-secret> osc admin list-instances eyevinn channel-engine
```

### Remove a channel-engine instance in dev env for tenant `asdasd` as an OSC super admin

```
PAT_SECRET=<pat-secret> osc --env dev admin remove-instance asdasd channel-engine mychannel
```
