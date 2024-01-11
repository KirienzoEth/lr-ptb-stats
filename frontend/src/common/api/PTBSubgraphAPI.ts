import { CaveCurrency, Network } from '../enums';
import { IHTTPClient } from '../http-client/IHTTPClient';

export class PTBSubgraphAPI {
  private urlEthereum =
    'https://api.thegraph.com/subgraphs/name/kirienzoeth/lr-ptb-stats';
  private urlArbitrum =
    'https://api.thegraph.com/subgraphs/name/kirienzoeth/lr-ptb-stats-arbitrum';
  private httpClient: IHTTPClient;

  constructor(httpClient: IHTTPClient) {
    this.httpClient = httpClient;
  }

  private getUrlForNetwork(network: Network) {
    switch (network) {
      case Network.ARBITRUM:
        return this.urlArbitrum;
      case Network.ETHEREUM:
        return this.urlEthereum;
      default:
        throw new Error(`No subgraph for network ${network}`);
    }
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
      playerAddress: rawData.player.id,
      playerName: rawData.player.ensName ?? undefined,
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

  private parseRawRoundData(rawData: GQLRound): Round {
    return {
      id: rawData.roundId,
      caveId: rawData.cave.id,
      caveEnterAmount: BigInt(rawData.cave.enterAmount),
      cavePrizeAmount: BigInt(rawData.cave.prizeAmount),
      currency:
        rawData.cave.currency === '0x0000000000000000000000000000000000000000'
          ? CaveCurrency.ETH
          : CaveCurrency.LOOKS,
      loser: this.parseRawPlayerData(rawData.loser),
      players: rawData.players.map((playerRound) =>
        this.parseRawPlayerData(playerRound.player)
      ),
    };
  }

  async getPTBGame(network = Network.ETHEREUM): Promise<Game> {
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
    const data = await this.httpClient.post(
      this.getUrlForNetwork(network),
      body
    );
    return this.parseRawGameData(data.data.game);
  }

  async getPlayers(
    network = Network.ETHEREUM,
    addresses: string[] = []
  ): Promise<Player[]> {
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
    const data = await this.httpClient.post(
      this.getUrlForNetwork(network),
      body
    );
    return data.data.players.map(
      (player: GQLPlayer): Player => this.parseRawPlayerData(player)
    );
  }

  async getPlayersDailyData(
    network = Network.ETHEREUM,
    addresses: string[],
    from?: number,
    to?: number
  ): Promise<PlayerDailyData[]> {
    const filter: GQLPlayerDailyDataFilter = {};
    if (addresses.length > 0) {
      filter['player_in'] = addresses.map((address) => address.toLowerCase());
    }
    if (from) {
      filter['timestamp_gte'] = from;
    }
    if (to) {
      filter['timestamp_lte'] = to;
    }

    const body = {
      query: `
        query GetPlayersDailyData($filter: PlayerDailyData_filter) {
          playerDailyDatas(where: $filter, orderBy: timestamp, orderDirection: asc, first: 1000) {
            id
            player {
              id
              ensName
            }
            timestamp
            looksPnL
            ethPnL
            usdPnL
            roundsPlayed
            cumulatedLooksPnL
            cumulatedEthPnL
            cumulatedUsdPnL
            cumulatedRoundsPlayed
          }
        }
      `,
      variables: {
        filter,
      },
    };
    const data = await this.httpClient.post(
      this.getUrlForNetwork(network),
      body
    );
    return data.data.playerDailyDatas.map(
      (playerDailyData: GQLPlayerDailyData): PlayerDailyData =>
        this.parseRawPlayerDailyData(playerDailyData)
    );
  }

  async getTopPlayers(
    network = Network.ETHEREUM,
    page = 0,
    limit = 10
  ): Promise<Player[]> {
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
    const data = await this.httpClient.post(
      this.getUrlForNetwork(network),
      body
    );
    return data.data.players.map(
      (player: GQLPlayer): Player => this.parseRawPlayerData(player)
    );
  }

  async getPlayersRounds(
    network = Network.ETHEREUM,
    addresses: string[],
    page = 0,
    limit = 10
  ): Promise<Round[]> {
    const lcAddresses = addresses.map((address) => address.toLowerCase());
    const body = {
      query: `
        query getRounds($addresses: [String!]!, $limit: Int!, $skip: Int!) {
          rounds(where: {status: REVEALED, players_: {player_in: $addresses}}, orderBy: closedTimestamp, orderDirection: desc, first: $limit, skip: $skip) {
            roundId
            cave {
              id
              enterAmount
              prizeAmount
              currency
            }
            loser {
              id
              ensName
            }
            players {
              feesPaidInETH
              player {
                id
                ensName
              }
            }
          }
        }
      `,
      variables: {
        addresses: lcAddresses,
        limit,
        skip: page * limit,
      },
    };
    const data = await this.httpClient.post(
      this.getUrlForNetwork(network),
      body
    );
    return data.data.rounds.map(
      (round: GQLRound): Round => this.parseRawRoundData(round)
    );
  }
}
