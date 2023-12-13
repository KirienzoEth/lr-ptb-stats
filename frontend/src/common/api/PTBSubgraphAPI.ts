import { IHTTPClient } from '../http-client/IHTTPClient';

export class PTBSubgraphAPI {
  private url =
    'https://api.thegraph.com/subgraphs/name/kirienzoeth/lr-ptb-stats';
  private httpClient: IHTTPClient;

  constructor(httpClient: IHTTPClient) {
    this.httpClient = httpClient;
  }

  async getPlayers(): Promise<Player[]> {
    const body = {
      query: `{
        players(orderBy: usdWagered, orderDirection: desc, first: 20) {
          id,
          usdPnL,
          usdWagered,
          looksWagered,
          looksWon,
          looksLost,
          ethWagered,
          ethWon,
          ethLost,
          feesPaidInETH,
          feesPaidInUSD,
          roundsEnteredCount,
          roundsWonCount,
          roundsLostCount,
        }
      }`,
    };

    const data = await this.httpClient.post(this.url, body);
    return data.data.players.map((player: GQLPlayer) => {
      return {
        address: player.id,
        looksWagered: BigInt(player.looksWagered ?? 0),
        ethWagered: BigInt(player.ethWagered ?? 0),
        usdWagered: BigInt(player.usdWagered ?? 0),
        looksWon: BigInt(player.looksWon ?? 0),
        ethWon: BigInt(player.ethWon ?? 0),
        usdWon: BigInt(player.usdWon ?? 0),
        looksLost: BigInt(player.looksLost ?? 0),
        ethLost: BigInt(player.ethLost ?? 0),
        usdLost: BigInt(player.usdLost ?? 0),
        usdPnL: BigInt(player.usdPnL ?? 0),
        feesPaidInETH: BigInt(player.feesPaidInETH ?? 0),
        feesPaidInUSD: BigInt(player.feesPaidInUSD ?? 0),
        roundsWonCount: BigInt(player.roundsWonCount ?? 0),
        roundsLostCount: BigInt(player.roundsLostCount ?? 0),
        roundsEnteredCount: BigInt(player.roundsEnteredCount ?? 0),
      } as Player;
    });
  }
}
