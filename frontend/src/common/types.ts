enum CaveCurrency {
  LOOKS,
  ETH,
}

interface Player {
  address: string;
  ensName: string;
  looksWagered: bigint;
  ethWagered: bigint;
  usdWagered: bigint;
  looksWon: bigint;
  ethWon: bigint;
  usdWon: bigint;
  looksLost: bigint;
  ethLost: bigint;
  usdLost: bigint;
  usdPnL: bigint;
  feesPaidInETH: bigint;
  feesPaidInUSD: bigint;
  roundsWonCount: bigint;
  roundsLostCount: bigint;
  roundsEnteredCount: bigint;
}

interface PlayerDailyData {
  playerAddress: string;
  playerName?: string;
  timestamp: bigint;
  looksPnL: bigint;
  ethPnL: bigint;
  usdPnL: bigint;
  roundsPlayed: bigint;
  cumulatedLooksPnL: bigint;
  cumulatedEthPnL: bigint;
  cumulatedUsdPnL: bigint;
  cumulatedRoundsPlayed: bigint;
}

interface GQLPlayer {
  id: string;
  ensName: string;
  looksWagered: string;
  ethWagered: string;
  usdWagered: string;
  looksWon: string;
  ethWon: string;
  usdWon: string;
  looksLost: string;
  ethLost: string;
  usdLost: string;
  usdPnL: string;
  feesPaidInETH: string;
  feesPaidInUSD: string;
  roundsWonCount: string;
  roundsLostCount: string;
  roundsEnteredCount: string;
}

interface GQLPlayerDailyData {
  id: string;
  player: {
    id: string;
    ensName: string | null;
  };
  timestamp: string;
  looksPnL: string;
  ethPnL: string;
  usdPnL: string;
  roundsPlayed: string;
  cumulatedLooksPnL: string;
  cumulatedEthPnL: string;
  cumulatedUsdPnL: string;
  cumulatedRoundsPlayed: string;
}

interface Game {
  name: string;
  ethEarned: bigint;
  looksEarned: bigint;
  usdEarned: bigint;
  usdVolume: bigint;
  roundsPlayed: number;
}

interface GQLGame {
  id: string;
  ethEarned: string;
  looksEarned: string;
  usdEarned: string;
  usdVolume: string;
  roundsPlayed: string;
}

interface Round {
  id: string;
  caveId: string;
  caveEnterAmount: bigint;
  cavePrizeAmount: bigint;
  loser: Player;
  players: Player[];
  currency: CaveCurrency;
}

interface GQLRound {
  roundId: string;
  cave: {
    id: string;
    enterAmount: string;
    currency: string;
    prizeAmount: string;
  };
  loser: GQLPlayer;
  players: { player: GQLPlayer; feesPaidInETH: string }[];
}

interface GQLPlayerFilter {
  id_in?: string[];
}

interface GQLPlayerDailyDataFilter {
  player_in?: string[];
  timestamp_gte?: number;
  timestamp_lte?: number;
}
