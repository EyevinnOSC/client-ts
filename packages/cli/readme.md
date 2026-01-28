# Command Line Utility for Open Source Cloud

CLI for working and scripting with [Open Source Cloud](www.osaas.io)

Prerequisites:

- Node >18
- An Open Source Cloud account

## Install

```
npm install -g @osaas/cli
```

## Authentication

You can authenticate with Open Source Cloud in two ways:

### Option 1: Login via browser (recommended)

Run the `login` command to authenticate using your browser. The token is saved to `~/.osc` and used automatically for subsequent commands.

```
% osc login
Opening browser for login...
Login successful! Token saved to ~/.osc
```

When using a non-production environment:

```
% osc --env dev login
```

### Option 2: Personal Access Token

Set the environment variable `OSC_ACCESS_TOKEN` with your personal access token. Obtain the personal access token in the Eyevinn Open Source Cloud web console.

```
% export OSC_ACCESS_TOKEN=<personal-access-token>
```

### Auto-prompt

If neither a saved token nor `OSC_ACCESS_TOKEN` is found when running a command, the CLI will prompt you to login interactively.

## Usage

```
% osc
Usage: osc [options] [command]

Options:
  -v, --version                                    Output the current version
  --env <environment>                              Environment to use
  -h, --help                                       display help for command

Commands:
  login                                            Login to Open Source Cloud using OAuth
  admin                                            Administrative commands for OSC super admins
  list <serviceId>                                 List all my service instances
  create [options] <serviceId> <name>              Create a service instance
  describe <serviceId> <name>                      Get details for a service instance
  remove [options] <serviceId> <name>              Remove a service instance
  logs <serviceId> <name>                          Get logs for a service instance
  restart <serviceId> <name>                       Restart a service instance
  get-instance-replicas <serviceId> <name>         Get the number of replicas for a service instance
  set-instance-replicas <serviceId> <name> <n>     Set the number of replicas for a service instance
  service-access-token <serviceId>                 Generate a service access token for a service
  list-reserved-nodes                              List all my reserved nodes
  secrets                                          Manage secrets for services (list, create, update, remove)
  packager [options] <source> <dest>               Create streaming package from ABR bundle on S3
  compare vmaf [options] <reference> <distorted> <result>
                                                   Compare two video files using VMAF
  live                                             Live streaming commands
  intercom                                         Intercom messaging commands
  transcribe [options] <source>                    Generate subtitles from video or audio using OpenAI Whisper
  db                                               Database management commands
  architect                                        AI chat assistant for architecture guidance
  vod                                              VOD transcoding and packaging commands
  web                                              Web publishing and configuration commands
  help [command]                                   display help for command
```

## Examples

### Create a MinIO storage service and bucket

Create a MinIO storage server instance called `mystore` with the given credentials.

```
% osc create minio-minio mystore -o RootUser=admin -o RootPassword=abC12345678
Instance created:
{
  name: 'mystore',
  url: 'https://eyevinnlab-mystore.minio-minio.auto.prod.osaas.io',
  resources: {
    license: { url: 'https://api-minio-minio.auto.prod.osaas.io/license' },
    app: {
      url: 'https://eyevinnlab-mystore.minio-minio.auto.prod.osaas.io/'
    }
  },
  RootUser: 'admin',
  RootPassword: 'abC12345678'
}
```

Install the MinIO client to create a bucket on this server. If you already have MinIO client installed you can skip this step.

```
% brew install minio/stable/mc
```

Setup an alias to your server. Replace the URL below with the instance URL returned when created the store.

```
% mc alias set mystore https://eyevinnlab-mystore.minio-minio.auto.prod.osaas.io admin abC12345678
```

Create a bucket called `mybucket`

```
% mc mb mystore/mybucket
Bucket created successfully `mystore/mybucket`.
```

To access the bucket using the AWS S3 client:

```
% AWS_ACCESS_KEY_ID=admin AWS_SECRET_ACCESS_KEY=abC12345678 \
  aws s3 --endpoint=https://eyevinnlab-mystore.minio-minio.auto.prod.osaas.io \
  cp images.jpeg s3://mybucket/
upload: images.jpeg to s3://mybucket/images.jpeg
% AWS_ACCESS_KEY_ID=admin AWS_SECRET_ACCESS_KEY=abC12345678 \
  aws s3 --endpoint=https://eyevinnlab-mystore.minio-minio.auto.prod.osaas.io \
  ls s3://mybucket/
2025-01-21 10:35:11      12533 images.jpeg
```

### List all my MinIO storage services

```
% osc list minio-minio
```

### Enable CDN for access to MinIO bucket

Allow public read access to bucket.

```
% mc anonymous set download mystore/mybucket
```

Setup CDN property in AWS Cloudfront

```
% osc web cdn-create --provider=cloudfront --origin-path=/mybucket minio-minio mystore
```

### Remove a MinIO storage bucket

```
% osc remove minio-minio mystore
Are you sure you want to remove mystore? (yes/no) yes
```

### Create a service instance with safe name option

Create a service instance with invalid characters stripped from the name:

```bash
% osc create minio-minio "my store with spaces!" --safe-name -o RootUser=admin -o RootPassword=abC12345678
```

### Instance replica management

Get the number of replicas for a service instance:

```bash
% osc get-instance-replicas minio-minio mystore
Instance mystore has 1 actual replicas and 1 desired replicas.
```

Set the number of replicas:

```bash
% osc set-instance-replicas minio-minio mystore 3
Set desired replicas for instance mystore to 3.
```

### Service instance management

Restart a service instance:

```bash
% osc restart minio-minio mystore
```

List your reserved nodes:

```bash
% osc list-reserved-nodes
```

Generate a service access token:

```bash
% osc service-access-token minio-minio
```

### Create ABR file for VOD using SVT Encore

Create a VOD file for streaming from using a pipeline named `demo`. Follow the steps in the [Eyevinn Open Source Cloud documentation](https://docs.osaas.io/osaas.wiki/Solution%3A-VOD-Transcoding.html#vod-transcoding-and-packaging) on how to setup a pipeline.

```
% osc vod create demo https://testcontent.eyevinn.technology/mp4/VINN.mp4
```

Create a VOD file with a specific transcoding profile:

```
% osc vod create demo https://testcontent.eyevinn.technology/mp4/VINN.mp4 --profile x264-high
```

Remove a VOD pipeline but keep the VOD files:

```
% osc vod cleanup demo
```

### Live streaming

Start a single bitrate live stream:

```bash
% osc live start-single mystreamname
Start streaming to rtmp://... and watch at https://...
```

Stop and remove a single bitrate live stream:

```bash
% osc live stop-single mystreamname
```

List all single bitrate live streams:

```bash
% osc live list-single
```

Create and start a multi bitrate live stream:

```bash
% osc live create-multi mystreamname
```

Start an existing multi bitrate live stream:

```bash
% osc live start-multi mystreamname
```

Stop a multi bitrate live stream:

```bash
% osc live stop-multi mystreamname
```

### Database management

Create a Valkey database:

```bash
% osc db create valkey mydb
```

List all databases of a given type:

```bash
% osc db list valkey
```

Remove a database:

```bash
% osc db remove valkey mydb
```

### Intercom

List productions in an intercom system:

```bash
% osc intercom list-productions myintercom
```

Create a production with lines:

```bash
% osc intercom create-production myintercom "My Production" line1 line2
```

Delete a production:

```bash
% osc intercom delete-production myintercom <productionId>
```

### AI architect chat

Start an interactive chat session with the AI assistant:

```bash
% osc architect chat
```

### Compare video files using VMAF

Compare two video files and get a VMAF quality score:

```bash
% osc compare vmaf s3://bucket/reference.mp4 s3://bucket/distorted.mp4 s3://bucket/vmaf-result.json
```

Custom AWS credentials and S3 endpoint can be provided:

```bash
% osc compare vmaf \
  --aws-access-key-id=AKID --aws-secret-access-key=SECRET \
  --s3-endpoint-url=https://s3.example.com \
  s3://bucket/reference.mp4 s3://bucket/distorted.mp4 s3://bucket/vmaf-result.json
```

### Generate subtitles from video or audio

Generate subtitles using OpenAI Whisper:

```bash
% export OPENAI_API_KEY=<your-openai-api-key>
% osc transcribe https://example.com/video.mp4 --format vtt --language en
```

### Create streaming package

Create a streaming package from an ABR bundle on S3:

```bash
% osc packager -v video_1.mp4 video_2.mp4 -a audio.mp4 s3://source-bucket/abr s3://dest-bucket/package
```

### Manage service secrets

List secrets for a service:

```bash
% osc secrets list minio-minio
```

Create a new secret:

```bash
% osc secrets create minio-minio mysecret myvalue
```

Update an existing secret:

```bash
% osc secrets update minio-minio mysecret newvalue
```

Remove a secret:

```bash
% osc secrets remove minio-minio mysecret
```

### Web publishing and configuration

Publish a website:

```bash
% osc web publish mysite ./dist
```

Create a CDN distribution:

```bash
% osc web cdn-create --provider=cloudfront --origin-path=/mybucket minio-minio mystore
```

### Application configuration service

Create a configuration service instance:

```bash
% osc web config-create jonastest
Configuration service instance available at https://eyevinnlab-jonastest.eyevinn-app-config-svc.auto.prod.osaas.io
```

And to remove it (with the data):

```bash
% osc web config-delete --data jonastest
```

Store application configuration values as environment variables:

```bash
% osc web config-to-env <config-instance-name>
export AWS_ACCESS_KEY_ID=admin
export CHANNELURL=https://eyevinnlab.ce.prod.osaas.io/channels/mychannel/master.m3u8
```

And storing it in the shell:

```bash
% eval `osc web config-to-env <config-instance-name>`
```

### Admin commands

List all channel-engine instance for tenant `eyevinn` as an OSC super admin:

```
PAT_SECRET=<pat-secret> osc admin list-instances eyevinn channel-engine
```

Remove a channel-engine instance in dev env for tenant `asdasd` as an OSC super admin:

```
PAT_SECRET=<pat-secret> osc --env dev admin remove-instance asdasd channel-engine mychannel
```
