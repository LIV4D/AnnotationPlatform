import * as config from 'config';
import * as readline from 'readline';
import * as fs from 'fs';
import { Connection, ConnectionOptions, createConnection, InsertResult } from 'typeorm';

const seedingFiles = {
    development: [
        'user-dev.json',
        // 'image-dev.json',
        'taskGroup-dev.json',
        // 'annotation-dev.json',
        'task-dev.json',
        // TODO: add Evenement.json
    ],
    test: [
        'taskType-dev.json',
        'imageType-dev.json',
        'biomarkerType-dev.json',
        'user-dev.json',
        'image-dev.json',
        'task-dev.json',
        'revision-dev.json',
        'preprocessingType-dev.json',
        'preprocessing-dev.json',
    ],
    production: [
        'imageType-prod.json',
        'biomarkerType-prod.json',
        'preprocessingType-prod.json',
        'taskType-prod.json',
        'user-prod.json',
    ],
};

export async function loadSeeds(): Promise<any> {
    const databaseConfig: ConnectionOptions = {
        ...config.get('database'),
        name: 'seedingConnection',
        dropSchema: true,
    };
    const connection = await createConnection(databaseConfig);
    for (const file of seedingFiles[process.env['NODE_ENV']]) {
        await loadSeed(file, connection);
    }
}

async function loadSeed(fileName: string, connection: Connection): Promise<any> {
    let items: any[] = [];
    let entityName: string;
    try {
        console.log(`Seeding ${fileName}`);
        const seedsDirectory = process.env['NODE_ENV'] === 'development' ? 'dev_entities' : 'seeds';
        const data = JSON.parse(fs.readFileSync(`./seeding/${seedsDirectory}/${fileName}`).toString(), (key, value) => {
            // Used in order to correctly save buffer array in database.
            if (key === 'password' || key === 'salt') {
                return Buffer.from(value);
            } else {
                return value;
            }
        });
        items = data.items;
        entityName = data.entityName;
    } catch (error) {
        console.log(error);
    }
    if (!items || items.length === 0) { return; }
    await insertItems(connection, entityName, items);
    await insertRelations(connection, entityName, items);
}

async function insertItems(connection: Connection, entityName: string, items: any[]) {
    const qb = await connection.createQueryBuilder();
    let insertionResult: InsertResult;
    try {
        insertionResult =  await qb
        .insert().into(entityName).values(items).execute();
    } catch (error) {
        console.error(`error: ${error}`);
    }
    return await insertionResult;
}

async function insertRelations(connection: Connection, entityName: string, items: any[]) {
    try {
        const relationQueryBuilder = connection.createQueryBuilder();
        for (const item of items) {
            if (item.manyToMany != null) {
                for (const key of Object.keys(item.manyToMany)) {
                    await relationQueryBuilder.relation(entityName, key)
                        .of(item.id).add(item.manyToMany[key]);
                }
            }
            if (item.oneToMany != null) {
                for (const key of Object.keys(item.oneToMany)) {
                    await relationQueryBuilder.relation(entityName, key)
                        .of(item.id).add(item.oneToMany[key]);
                }
            }
            if (item.manyToOne != null) {
                for (const key of Object.keys(item.manyToOne)) {
                    await relationQueryBuilder.relation(entityName, key)
                        .of(item.id).set(item.manyToOne[key]);
                }
            }
        }
    } catch (error) {
        console.error(`error: ${error}\n`);
    }
}

if (require.main === module) {
    const dbInfo: any = config.get('database');
    console.log(`This will delete all the data stored in the following database: \
            ${ dbInfo.database}@${dbInfo.host}: ${dbInfo.port} `);
    console.log(`Are you sure you want to proceed ? `);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('(Y/N) ? ', answer => {
        if (answer.toLowerCase() === 'y') {
            loadSeeds().then(() => process.exit());
        } else {
            process.exit();
        }
    });
}
