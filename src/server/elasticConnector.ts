import elasticsearch, { Client } from 'elasticsearch';
import { activeConfig } from '../config';

let elastic: Client;

export const initElastic = () => {
	if (elastic) return elastic;
	const { username, password } = activeConfig.elastic.auth;
	return new elasticsearch.Client({
		host: activeConfig.elastic.node,
		log: 'warning',
		httpAuth: username ? `${username}:${password}` : undefined,
	});
};