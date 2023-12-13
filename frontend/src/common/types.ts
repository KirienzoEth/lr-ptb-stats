interface Player {
  address: string;
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

interface GQLPlayer {
  id: string;
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
