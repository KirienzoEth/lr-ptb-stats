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
  player: string;
  timestamp: bigint;
  looksPnL: bigint;
  ethPnL: bigint;
  usdPnL: bigint;
  roundsPlayed: bigint;
  cumulatedLooksPnL: bigint;
  cumulatedEthPnL: bigint;
  cumulatedUsdPnL: bigint;
  cumulativeRoundsPlayed: bigint;
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
  player: string;
  timestamp: string;
  looksPnL: string;
  ethPnL: string;
  usdPnL: string;
  roundsPlayed: string;
  cumulatedLooksPnL: string;
  cumulatedEthPnL: string;
  cumulatedUsdPnL: string;
  cumulativeRoundsPlayed: string;
}

interface GQLPlayerFilter {
  id_in?: string[];
}
