import elasticsearch, { Client } from '@elastic/elasticsearch';
import { activeConfig } from '../config';

let elastic: Client;

export const initElastic = () => {
	if (elastic) return elastic;
	const { username, password } = activeConfig.server.elastic.auth;
	return new elasticsearch.Client({
		node: activeConfig.server.elastic.node,
    auth: username && password ?
      {
        username,
        password
      }
      :
      undefined,
	});
};

// TEMPORARY types until @elastic/elasticsearch adds them
// Complete definition of the Search response
interface ShardsResponse {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
}

interface Explanation {
  value: number;
  description: string;
  details: Explanation[];
}

export interface SearchResponse<T> {
  took: number;
  timed_out: boolean;
  _scroll_id?: string;
  _shards: ShardsResponse;
  hits: {
    total: number;
    max_score: number;
    hits: Array<{
      _index: string;
      _type: string;
      _id: string;
      _score: number;
      _source: T;
      _version?: number;
      _explanation?: Explanation;
      fields?: any;
      highlight?: any;
      inner_hits?: any;
      matched_queries?: string[];
      sort?: string[];
    }>;
  };
  aggregations?: any;
}

export interface IndexResponse {
  _index: string
  _type: string
  _id: string
  _version: number
  result: string
  _shards: {
    total: number
    successful: number
    failed: number
  },
  _seq_no: number
  _primary_term: number
}