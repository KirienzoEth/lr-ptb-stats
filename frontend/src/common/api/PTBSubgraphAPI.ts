import { IHTTPClient } from '../http-client/IHTTPClient';

export class PTBSubgraphAPI {
  private url =
    'https://api.thegraph.com/subgraphs/name/kirienzoeth/lr-ptb-stats';
  private httpClient: IHTTPClient;

  constructor(httpClient: IHTTPClient) {
    this.httpClient = httpClient;
  }

  private parseRawPlayerData(rawPlayerData: GQLPlayer): Player {
    return {
      address: rawPlayerData.id,
      ensName: rawPlayerData.ensName,
      looksWagered: BigInt(rawPlayerData.looksWagered ?? 0),
      ethWagered: BigInt(rawPlayerData.ethWagered ?? 0),
      usdWagered: BigInt(rawPlayerData.usdWagered ?? 0),
      looksWon: BigInt(rawPlayerData.looksWon ?? 0),
      ethWon: BigInt(rawPlayerData.ethWon ?? 0),
      usdWon: BigInt(rawPlayerData.usdWon ?? 0),
      looksLost: BigInt(rawPlayerData.looksLost ?? 0),
      ethLost: BigInt(rawPlayerData.ethLost ?? 0),
      usdLost: BigInt(rawPlayerData.usdLost ?? 0),
      usdPnL: BigInt(rawPlayerData.usdPnL ?? 0),
      feesPaidInETH: BigInt(rawPlayerData.feesPaidInETH ?? 0),
      feesPaidInUSD: BigInt(rawPlayerData.feesPaidInUSD ?? 0),
      roundsWonCount: BigInt(rawPlayerData.roundsWonCount ?? 0),
      roundsLostCount: BigInt(rawPlayerData.roundsLostCount ?? 0),
      roundsEnteredCount: BigInt(rawPlayerData.roundsEnteredCount ?? 0),
    };
  }

  private parseRawPlayerDailyData(
    rawData: GQLPlayerDailyData
  ): PlayerDailyData {
    return {
      player: rawData.player,
      timestamp: BigInt(rawData.timestamp),
      looksPnL: BigInt(rawData.looksPnL),
      ethPnL: BigInt(rawData.ethPnL),
      usdPnL: BigInt(rawData.usdPnL),
      roundsPlayed: BigInt(rawData.roundsPlayed),
      cumulatedLooksPnL: BigInt(rawData.cumulatedLooksPnL),
      cumulatedEthPnL: BigInt(rawData.cumulatedEthPnL),
      cumulatedUsdPnL: BigInt(rawData.cumulatedUsdPnL),
      cumulatedRoundsPlayed: BigInt(rawData.cumulatedRoundsPlayed),
    };
  }

  private parseRawGameData(rawData: GQLGame): Game {
    return {
      name: rawData.id,
      ethEarned: BigInt(rawData.ethEarned),
      looksEarned: BigInt(rawData.looksEarned),
      usdEarned: BigInt(rawData.usdEarned),
      usdVolume: BigInt(rawData.usdVolume),
      roundsPlayed: +rawData.roundsPlayed,
    };
  }

  async getPTBGame(): Promise<Game> {
    const body = {
      query: `
        query getGame($id: ID!) {
          game(id: $id) {
            id
            ethEarned
            looksEarned
            usdEarned
            usdVolume
            roundsPlayed
          }
        }
      `,
      variables: {
        id: 'PTB',
      },
    };
    const data = await this.httpClient.post(this.url, body);
    return this.parseRawGameData(data.data.game);
  }

  async getPlayers(addresses: string[] = []): Promise<Player[]> {
    const filter: GQLPlayerFilter = {};
    if (addresses.length > 0) {
      filter['id_in'] = addresses.map((address) => address.toLowerCase());
    }

    const body = {
      query: `
        query GetPlayers($filter: Player_filter!) {
          players(
            where: $filter
            orderBy: usdWagered
            orderDirection: desc
            first: 20
          ) {
            id
            ensName
            usdPnL
            usdWagered
            looksWagered
            looksWon
            looksLost
            ethWagered
            ethWon
            ethLost
            feesPaidInETH
            feesPaidInUSD
            roundsEnteredCount
            roundsWonCount
            roundsLostCount
          }
        }
      `,
      variables: {
        filter,
      },
    };
    const data = await this.httpClient.post(this.url, body);
    return data.data.players.map(
      (player: GQLPlayer): Player => this.parseRawPlayerData(player)
    );
  }

  async getTopPlayers(limit: number, page = 0): Promise<Player[]> {
    const body = {
      query: `
        query GetPlayers($limit: Int!, $skip: Int!) {
          players(
            orderBy: usdWagered
            orderDirection: desc
            first: $limit
            skip: $skip
          ) {
            id
            ensName
            usdPnL
            usdWagered
            looksWagered
            looksWon
            looksLost
            ethWagered
            ethWon
            ethLost
            feesPaidInETH
            feesPaidInUSD
            roundsEnteredCount
            roundsWonCount
            roundsLostCount
          }
        }
      `,
      variables: {
        limit,
        skip: page * limit,
      },
    };
    const data = await this.httpClient.post(this.url, body);
    return data.data.players.map(
      (player: GQLPlayer): Player => this.parseRawPlayerData(player)
    );
  }

  async getplayersDailyData(playerAddresses: string[]) {}
}
