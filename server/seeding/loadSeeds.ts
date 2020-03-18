import * as config from 'config';
import * as readline from 'readline';
import * as fs from 'fs';
import { Connection, ConnectionOptions, createConnection, InsertResult } from 'typeorm';

const seedingFiles = [
        'user.json',
        'image.json',
        'submissionEvent.json',
        'annotation.json',
        'taskType.json',
        'task.json',
    ];

export async function loadSeeds(): Promise<any> {

    // database config json files are in config folder. That is where the entities to be created are defined.
    // entities are created from the js models in the out folder, so make sure to recompile the server after changing models
    const databaseConfig: ConnectionOptions = {
        ...config.get('database'),
        name: 'seedingConnection',
        dropSchema: true,
    };

    // Create the tables in the DB and allows connection
    const connection = await createConnection(databaseConfig);

    // This populates the tables with the data in the json files
    for (const file of seedingFiles) {
        await loadSeed(file, connection);
    }
}

async function loadSeed(fileName: string, connection: Connection): Promise<any> {
    let items: any[] = [];
    let entityName: string;
    try {
        // // console.log(`Seeding ${fileName}`);
        const seedsDirectory = process.env['NODE_ENV'] === 'test' ? 'test_seeds' : 'std_seeds';
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
        console.error(error);
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
    // // console.log(`This will delete all the data stored in the following database: \
            ${ dbInfo.database}@${dbInfo.host}: ${dbInfo.port} `);
    // // console.log(`Are you sure you want to proceed ? `);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('(Y/N) ? ', answer => {
        if (answer.toLowerCase() === 'y') {
            loadSeeds().then(() => process.exit());
        } else {
            process.exit();
        }
    });
}
