import elasticsearch, { Client } from 'elasticsearch';
import { activeConfig } from '../config';

let elastic: Client;

export const initElastic = () => {
	if (elastic) return elastic;
	const { username, password } = activeConfig.server.elastic.auth;
	return new elasticsearch.Client({
		host: activeConfig.server.elastic.node,
		log: 'warning',
		httpAuth: username ? `${username}:${password}` : undefined,
	});
};