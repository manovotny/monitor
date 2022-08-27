import fs from 'node:fs';
import {parse} from 'node:path';
import stream from 'node:stream/promises';

import es from 'event-stream';
import got from 'got';
import {load} from 'cheerio';
import {unpack} from 'node-unar';
import {Listr} from 'listr2';
import {writeToPath} from '@fast-csv/format';
import * as dotenv from 'dotenv';

const {mkdir, rename, rm} = fs.promises;
const rf = {recursive: true, force: true};
const props = {};
const headers = [];
const types = [];
const rows = [];

const MOVIE_TYPE_ID = '6';
let lineNumber = 0;
let mediaTypeIdIndex;

dotenv.config();

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
        title: 'Cleaning previous up downloads',
        task: async () => {
            await rm('.data', {recursive: true, force: true});
            await mkdir('.data', {recursive: true});
        },
    },
    {
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
            new Promise((resolve, reject) => {
                const stream = fs.createReadStream(`.data/video`);

                stream.on('end', () => {
                    writeToPath('.data/video.csv', rows, {
                        headers,
                        quoteColumns: true,
                    })
                        .on('error', (err) => console.error(err))
                        .on('finish', () => resolve());
                });
                stream.on('error', (error) => reject(error));

                stream.pipe(es.split(/\u0002/)).pipe(
                    es.mapSync((raw) => {
                        lineNumber++;

                        if (!raw.length) {
                            return;
                        }

                        const line = raw.replace(/\r?\n|\r/, ' ').trim();

                        if (line.startsWith('#')) {
                            const uncommented = line.slice(1);

                            if (uncommented.startsWith('#legal')) {
                                return;
                            } else if (lineNumber === 1) {
                                headers.push(...uncommented.split(/\u0001/));
                                mediaTypeIdIndex = headers.indexOf('media_type_id');
                            } else {
                                const [key, value] = uncommented.split(':');

                                if (key === 'dbTypes') {
                                    types.push(...value.split(/\u0001/));
                                } else {
                                    props[key] = value;
                                }
                            }
                        }

                        const row = line.replace(/\u0002/, '').split(/\u0001/);

                        if (row[mediaTypeIdIndex] === MOVIE_TYPE_ID) {
                            rows.push(row);
                        }
                    })
                );
            }),
    },
]);

try {
    await tasks.run();

    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    console.log('memory', `${Math.round(used * 100) / 100} MB`);
    console.log('props', props);
    console.log('headers', headers);
    console.log('types', types);
    console.log('lines', lineNumber.toLocaleString('en-US'));
    console.log('rows', rows.length.toLocaleString('en-US'));
} catch (error) {
    console.error(error);
}
