import httpClient from '../http-client';
import { PTBSubgraphAPI } from './PTBSubgraphAPI';

const ptbSubgraphAPI = new PTBSubgraphAPI(httpClient);

export { ptbSubgraphAPI };
