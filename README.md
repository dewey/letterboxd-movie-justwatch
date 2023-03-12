# JustWatch Done Right

A movie stream search powered by JustWatch that integrates with Letterboxd, minus the headache of sifting through annoying, irrelevant recommendations - meaning no movie suggestions whatsoever... with a little plus 🏴‍☠️

## Run locally / debugging

PRE: You need to have docker to run the image at /redis folder

- Rename .env.example to .env & update the values
- Run `npm run start`

## Troubleshotting

- Read `redis/README.md`

## Gotchas

- When running `npm run fly:deploy` the contents of .env are used, meaning if you set up local redis the connection WILL fail when deployed

## First time deploying

- Replace "name" & "app" strings at package.json at fly.toml (respectively) with your new app name
- Run `npm i`
- Rename .env.example to .env
- Run `flyctl launch`
- When prompted for a builder, select builtin Nodejs.
- Run `npm run fly:deploy` (for following deploys only this command is needed)

## Stopping app (without deleting)

- `npm run fly:stop`

## Starting back again

- `npm run fly:start`

## Read secrets

- `npm run fly:ssh`
- type `env`
- quit with `exit`

## Set secrets

Add them to .env file. Alternatively use fly.io built command but note those take precedence over the ones at .env

- `flyctl secrets set SECRET="myvalue" -a <app-name>`

## Read server logs from terminal

- `npm run fly:logs`

## Redis

Upstash Redis created with `flyctl redis create`

- `flyctl redis list` & copy redis name
- `flyctl redis status <redis-name>` & then copy the Private URL & set the proper env variable at the .env file
