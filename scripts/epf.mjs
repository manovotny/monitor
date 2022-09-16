import fs from 'node:fs';
import {parse} from 'node:path';
import process from 'node:process';
import stream from 'node:stream/promises';

import es from 'event-stream';
import got from 'got';
import {load} from 'cheerio';
import {unpack} from 'node-unar';
import {Listr} from 'listr2';
import * as dotenv from 'dotenv';

const {mkdir, rename, rm} = fs.promises;
const rf = {recursive: true, force: true};

const FIELD_SEPARATOR = /\u0001/;
const RECORD_SEPARATOR = /\u0002/;
const MEDIA_TYPE_MOVIE = '6';
const COLLECTION_TYPE_MOVIE_BUNDLE = '8';

dotenv.config();

const asdf = ({input, output, checkMovieTypes}) =>
    new Promise((resolve, reject) => {
        const props = {};
        const databaseTypes = [];

        let lineNumber = 0;
        let mediaTypeIdIndex;
        let collectionTypeIdIndex;
        const readStream = fs.createReadStream(input);
        const writeStream = fs.createWriteStream(output);

        writeStream.on('finish', () => resolve());
        writeStream.on('error', (error) => reject(error));

        readStream.on('end', () => writeStream.end());
        readStream.on('error', (error) => reject(error));
        readStream.pipe(es.split(RECORD_SEPARATOR)).pipe(
            es.mapSync((raw) => {
                lineNumber++;

                const line = raw?.replace(/\r?\n|\r/, ' ').trim();

                if (line === undefined || !line.length) {
                    return;
                }

                if (line.startsWith('#')) {
                    const uncommented = line.slice(1);

                    if (uncommented.startsWith('#legal')) {
                        return;
                    } else if (lineNumber === 1) {
                        const headers = uncommented.split(FIELD_SEPARATOR);

                        mediaTypeIdIndex = headers.indexOf('media_type_id');
                        collectionTypeIdIndex = headers.indexOf('collection_type_id');

                        writeStream.write(`"${headers.join('","')}"\n`);
                    } else {
                        const [key, value] = uncommented.split(':');

                        if (key === 'dbTypes') {
                            databaseTypes.push(...value.split(FIELD_SEPARATOR));
                        } else {
                            props[key] = value;
                        }
                    }

                    return;
                }

                const row = line.split(FIELD_SEPARATOR);

                if (checkMovieTypes && (row[1] === '710076112' || row[1] === '1590580613' || row[1] === '1266863842')) {
                    console.log('row', row);
                    process.exit(0);
                }

                if (
                    !checkMovieTypes ||
                    ((mediaTypeIdIndex === -1 || row[mediaTypeIdIndex] === MEDIA_TYPE_MOVIE) &&
                        (collectionTypeIdIndex === -1 || row[collectionTypeIdIndex] === COLLECTION_TYPE_MOVIE_BUNDLE))
                ) {
                    writeStream.write(`"${row.map((field) => field.replaceAll('"', '""')).join('","')}"\n`);
                }
            })
        );
    });

const tasks = new Listr([
    {
        title: 'Checking for credentials',
        task: () => {
            if (!process.env.EPF_USERNAME) {
                throw new Error('`EPF_USERNAME` is not specified in `.env` file.');
            }

            if (!process.env.EPF_PASSWORD) {
                throw new Error('`EPF_PASSWORD` is not specified in `.env` file.');
            }
        },
    },
    {
        title: 'Cleaning up data processing',
        task: async () => {
            await rm('.data', rf);
            await mkdir('.data', {recursive: true});
        },
    },
    {
        skip: true,
        title: 'Downloading Enterprise Partner Feed from Apple',
        task: async (ctx, task) => {
            const baseUrl = 'https://feeds.itunes.apple.com/feeds/epf/v5/current/';
            const credentials = {
                username: process.env.EPF_USERNAME,
                password: process.env.EPF_PASSWORD,
            };
            const current = await got(baseUrl, credentials).text();

            const $ = load(current);

            await stream.pipeline(
                got
                    .stream(`${baseUrl}${$('a[href*=itunes]').text()}video.tbz`, credentials)
                    .on('downloadProgress', (progress) => {
                        task.output = `Progress: ${Math.floor(progress.percent * 100)}%`;
                    }),
                fs.createWriteStream('./.data/video.tbz')
            );
        },
    },
    {
        // `tar -xvf FILENAME` works on unix.
        skip: true,
        title: 'Extracting tar files',
        task: async (ctx, task) => {
            await unpack('.data/video.tbz', {
                targetDir: '.data',
                noDirectory: true,
                forceDirectory: false,
                copyTime: true,
            })
                .progress((files) => {
                    task.output = `Extracting: ${files}`;
                })
                .then(async (results) => {
                    const file = results.files[0];
                    const {base, dir} = parse(file);

                    await rename(`.data/${file}`, `.data/${base}`);
                    await rm(`.data/${dir}`, rf);
                });
        },
    },
    {
        title: 'Creating CSV files',
        task: (ctx, task) =>
            task.newListr([
                {
                    title: 'collection',
                    task: (ctx, task) =>
                        asdf({
                            checkMovieTypes: true,
                            input: '.epf/collection',
                            output: '.data/collection.csv',
                        }),
                },
                {
                    title: 'collection_type',
                    task: (ctx, task) =>
                        asdf({
                            input: '.epf/collection_type',
                            output: '.data/collection_type.csv',
                        }),
                },
                {
                    title: 'collection_video',
                    task: (ctx, task) =>
                        asdf({
                            input: '.epf/collection_video',
                            output: '.data/collection_video.csv',
                        }),
                },
                {
                    title: 'media_type',
                    task: (ctx, task) =>
                        asdf({
                            input: '.epf/media_type',
                            output: '.data/media_type.csv',
                        }),
                },
                {
                    title: 'storefront',
                    task: (ctx, task) =>
                        asdf({
                            input: '.epf/storefront',
                            output: '.data/storefront.csv',
                        }),
                },
                {
                    title: 'video',
                    task: (ctx, task) =>
                        asdf({
                            input: '.epf/video',
                            output: '.data/video.csv',
                        }),
                },
            ]),
    },
]);

try {
    await tasks.run();

    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    console.log('memory', `${Math.round(used * 100) / 100} MB`);
} catch (error) {
    console.error(error);
}
