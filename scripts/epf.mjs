import fs from 'fs';
import es from 'event-stream';
import {cwd} from 'process';

const props = {};
const columns = [];
const types = [];
const records = [];

const MOVIE_TYPE_ID = '6';
let lineNumber = 0;
let mediaTypeIdIndex;

fs.createReadStream(`${cwd()}/.data/video`)
    .pipe(es.split(/\u0002/))
    .pipe(
        es
            .mapSync((raw) => {
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
                        columns.push(...uncommented.split(/\u0001/));
                        mediaTypeIdIndex = columns.indexOf('media_type_id');
                    } else {
                        const [key, value] = uncommented.split(':');

                        if (key === 'dbTypes') {
                            types.push(...value.split(/\u0001/));
                        } else {
                            props[key] = value;
                        }
                    }
                }

                const record = line.replace(/\u0002/, '').split(/\u0001/);

                if (record[mediaTypeIdIndex] === MOVIE_TYPE_ID) {
                    records.push(...record);
                }
            })
            .on('error', (error) => {
                console.log('Error while reading file.', error);
            })
            .on('end', () => {
                const used = process.memoryUsage().heapUsed / 1024 / 1024;

                console.log('props', props);
                console.log('columns', columns);
                console.log('types', types);
                console.log('lines', lineNumber.toLocaleString('en-US'));
                console.log('records', records.length.toLocaleString('en-US'));
                console.log('memory', `${Math.round(used * 100) / 100} MB`);
            })
    );
