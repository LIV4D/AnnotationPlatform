import * as config from 'config';
import { Connection, ConnectionOptions, createConnection, getConnection, getConnectionManager } from 'typeorm';

export type ConnectionProvider = () => Promise<Connection>;

export const connectionProvider = () => {
    return () => {
        const databaseConfig: ConnectionOptions = { ...config.get('database') };
        return new Promise<Connection>((resolve) => {
            if (getConnectionManager().has('default')) {
                resolve(getConnection());
            } else {
                resolve(createConnection(databaseConfig));
            }
        });
    };
};
