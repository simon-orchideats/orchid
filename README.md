# Getting started

## Downlaods

Newer versions should be fine too

- https://www.elastic.co/downloads/elasticsearch (7.5.x)
- https://www.elastic.co/downloads/kibana (7.5.x)
- https://nodejs.org/en/download/ (12.14.x)

If you would like to dockerize the environment... that would be fantastic too

## Environment varaibles

Ask a developer friend for the environment variables

## Running

If running on windows, use the windows convenience script to run elastic & kibana together

Terminal 1. Get the db running
```
elasticsearch & kibana &
```

Termainal 2
```
npm install
npm run dev
```

## Database population

Run the put mapping + insert commands in `elasticCommands.jsonc`
