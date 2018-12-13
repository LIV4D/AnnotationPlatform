import 'reflect-metadata';
import TYPES from './types';
import { container } from './inversify.config';
import { Server } from './server';

const server: Server = container.get<Server>(TYPES.Server);

server.init();
