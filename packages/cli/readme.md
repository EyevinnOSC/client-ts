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
Usage: osc [options] [command]

Options:
  -v, --version                        Output the current version
  --env <environment>                  Environment to use
  -h, --help                           display help for command

Commands:
  admin                                Administrative commands for OSC super admins
  list <serviceId>                     List all my service instances
  create [options] <serviceId> <name>  Create a service instance
  describe <serviceId> <name>          Get details for a service instance
  remove [options] <serviceId> <name>  Remove a service instance
  restart <serviceId> <name>           Restart a service instance
  logs <serviceId> <name>              Get logs for a service instance
  list-reserved-nodes                  List all my reserved nodes
  service-access-token <serviceId>     Generate a service access token for a service
  secrets                              Manage secrets for services (list, create, update, remove)
  packager [options] <source> <dest>   Create streaming package from ABR bundle on S3
                                       and store on another S3 bucket
  compare vmaf <reference> <distorted> <result>  Compare two video files using VMAF
  live                                 Live streaming commands
  intercom                             Intercom messaging commands
  transcribe [options] <source>        Generate subtitles from video or audio using OpenAI Whisper
  db                                   Database management commands
  architect                            AI chat assistant for architecture guidance
  vod create [options] <name> <source> Create a VOD file ready for streaming
  vod cleanup <name>                   Remove VOD pipeline but keep VOD files
  web publish [options] <name> <dir>   Publish a website
  web cdn-create [options] <serviceId> <instanceName>  Create a CDN distribution
  web config-create <name>             Create a configuration service instance
  web config-delete [options] <name>   Delete a configuration service instance
  web config-to-env <name>             Export configuration values as environment variables
  help [command]                       display help for command
```

## Examples

First set the environment variable `OSC_ACCESS_TOKEN` with your personal access token. Obtain the personal access token in the Eyevinn Open Source Cloud web console.

```
% export OSC_ACCESS_TOKEN=<personal-access-token>
```

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

### List all channel-engine instance for tenant `eyevinn` as an OSC super admin

```
PAT_SECRET=<pat-secret> osc admin list-instances eyevinn channel-engine
```

### Remove a channel-engine instance in dev env for tenant `asdasd` as an OSC super admin

```
PAT_SECRET=<pat-secret> osc --env dev admin remove-instance asdasd channel-engine mychannel
```

### Create application configuration service instance

To manage configuration values for an application we can create an instance of an Application Config Service.

```bash
% osc web config-create jonastest
Configuration service instance available at https://eyevinnlab-jonastest.eyevinn-app-config-svc.auto.prod.osaas.io
```

And to remove it (with the data)

```bash
% osc web config-delete --data jonastest
```

### Store application configuration values as environment variables

Configuration values managed by the Application Config Service can be stored as environment variable using this commmand.

```bash
% osc web config-to-env <config-instance-name>
export AWS_ACCESS_KEY_ID=admin
export CHANNELURL=https://eyevinnlab.ce.prod.osaas.io/channels/mychannel/master.m3u8
```

And storing it in the shell.

```bash
% eval `osc web config-to-env <config-instance-name>`
```

### Compare video files using VMAF

Compare two video files and get a VMAF quality score:

```bash
% osc compare vmaf s3://bucket/reference.mp4 s3://bucket/distorted.mp4 s3://bucket/vmaf-result.json
```

### Generate subtitles from video or audio

Generate subtitles using OpenAI Whisper:

```bash
% export OPENAI_API_KEY=<your-openai-api-key>
% osc transcribe https://example.com/video.mp4 --format vtt --language en
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

### Create a service instance with safe name option

Create a service instance with invalid characters stripped from the name:

```bash
% osc create minio-minio "my store with spaces!" --safe-name -o RootUser=admin -o RootPassword=abC12345678
```
