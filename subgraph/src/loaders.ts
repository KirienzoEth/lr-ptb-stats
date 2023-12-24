import {
  Cave,
  Player,
  PlayerDailyData,
  PlayerRound,
  Game,
  GameDailyData,
  Round
} from '../generated/schema';
import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { RoundStatus } from './enums';

export function createGame(gameId: string): Game {
  const game = new Game(gameId);

  game.usdVolume = BigInt.zero();
  game.ethEarned = BigInt.zero();
  game.looksEarned = BigInt.zero();
  game.usdEarned = BigInt.zero();
  game.roundsPlayed = BigInt.zero();

  return game;
}

export function getGame(gameId: string): Game {
  let game = Game.load(gameId);
  if (game === null) {
    game = createGame(gameId);
  }

  return game;
}

export function createGameDayData(
  gameId: string,
  timestamp: BigInt
): GameDailyData {
  const game = new GameDailyData(`${gameId}-${timestamp.toString()}`);

  game.timestamp = timestamp;
  game.ethEarned = BigInt.zero();
  game.looksEarned = BigInt.zero();
  game.usdEarned = BigInt.zero();
  game.usdVolume = BigInt.zero();
  game.roundsPlayed = BigInt.zero();

  game.cumulatedLooksEarned = BigInt.zero();
  game.cumulatedEthEarned = BigInt.zero();
  game.cumulatedUsdEarned = BigInt.zero();
  game.cumulatedRoundsPlayed = BigInt.zero();
  game.save();

  return game;
}

export function createRound(roundId: string, caveId: string): Round {
  let round = new Round(caveId + '-' + roundId);
  round.cave = caveId;
  round.roundId = BigInt.fromString(roundId);
  round.status = RoundStatus.OPEN;
  round.playersCount = BigInt.zero();
  round.openedTimestamp = BigInt.zero();
  round.save();

  return round;
}

export function getRound(
  caveId: string,
  roundId: string,
  insertIfNotExist: bool = false
): Round {
  let round = Round.load(caveId + '-' + roundId);
  if (!round && insertIfNotExist) {
    round = createRound(roundId, caveId);
  } else if (!round) {
    log.error('Round ID {} from cave ID {} was not found', [roundId, caveId]);
    throw new Error();
  }

  return round;
}

export function createPlayer(playerAddress: string): Player {
  let player = new Player(playerAddress);

  player.feesPaidInETH = BigInt.zero();
  player.feesPaidInUSD = BigInt.zero();

  player.looksWagered = BigInt.zero();
  player.looksWon = BigInt.zero();
  player.looksLost = BigInt.zero();

  player.ethWagered = BigInt.zero();
  player.ethWon = BigInt.zero();
  player.ethLost = BigInt.zero();

  player.usdPnL = BigInt.zero();
  player.usdWagered = BigInt.zero();
  player.usdWon = BigInt.zero();
  player.usdLost = BigInt.zero();

  player.roundsEnteredCount = BigInt.zero();
  player.roundsWonCount = BigInt.zero();
  player.roundsLostCount = BigInt.zero();

  player.save();

  return player;
}

export function getPlayer(
  playerAddress: string,
  insertIfNotExist: bool = false
): Player {
  let player = Player.load(playerAddress);
  if (!player && insertIfNotExist) {
    player = createPlayer(playerAddress);
  } else if (!player) {
    log.error('Player with address {} was not found', [playerAddress]);
    throw new Error();
  }

  return player;
}

export function createCave(caveId: string): Cave {
  let cave = new Cave(caveId);
  cave.enterAmount = BigInt.zero();
  cave.prizeAmount = BigInt.zero();
  cave.currency = Address.zero();
  cave.roundDuration = BigInt.zero();
  cave.playersPerRound = 0;
  cave.protocolFeeBp = 0;
  cave.feeAmount = BigInt.zero();
  cave.isActive = true;
  cave.roundsCount = BigInt.zero();
  cave.maintenanceCost = BigInt.zero();
  cave.save();

  return cave;
}

export function getCave(caveId: string): Cave {
  let cave = Cave.load(caveId);
  if (!cave) {
    log.error('Cave ID {} was not found', [caveId]);
    throw new Error();
  }

  return cave;
}

export function createPlayerRound(
  playerAddress: string,
  caveId: string,
  roundId: string
): PlayerRound {
  let playerRound = new PlayerRound(`${playerAddress}-${caveId}-${roundId}`);
  playerRound.player = playerAddress;
  playerRound.cave = caveId;
  playerRound.round = `${caveId}-${roundId}`;
  playerRound.gemsEarned = BigInt.zero();
  playerRound.usdWagered = BigInt.zero();
  playerRound.feesPaidInETH = BigInt.zero();
  playerRound.feesPaidInUSD = BigInt.zero();
  playerRound.enteredTimestamp = BigInt.zero();
  playerRound.save();

  return playerRound;
}

export function getPlayerRound(
  playerAddress: string,
  caveId: string,
  roundId: string,
  insertIfNotExist: bool = false
): PlayerRound {
  let playerRoundId = `${playerAddress}-${caveId}-${roundId}`;
  let playerRound = PlayerRound.load(playerRoundId);
  if (!playerRound && insertIfNotExist) {
    playerRound = createPlayerRound(playerAddress, caveId, roundId);
  } else if (!playerRound) {
    log.error('player round ID {} was not found', [playerRoundId]);
    throw new Error();
  }

  return playerRound;
}

function createPlayerDailyData(
  playerAddress: string,
  timestamp: BigInt
): PlayerDailyData {
  const player = getPlayer(playerAddress);
  if (
    player.lastBetTimestamp !== null &&
    player.lastBetTimestamp === timestamp
  ) {
    log.critical(
      'Trying to create daily data that already exists for player {} at timestamp {}',
      [playerAddress, timestamp.toString()]
    );
  }

  const playerDailyData = new PlayerDailyData(`${playerAddress}-${timestamp}`);

  playerDailyData.player = playerAddress;
  playerDailyData.timestamp = timestamp;

  playerDailyData.ethPnL = BigInt.zero();
  playerDailyData.looksPnL = BigInt.zero();
  playerDailyData.usdPnL = BigInt.zero();
  playerDailyData.roundsPlayed = BigInt.zero();

  playerDailyData.cumulatedEthPnL = BigInt.zero();
  playerDailyData.cumulatedLooksPnL = BigInt.zero();
  playerDailyData.cumulatedUsdPnL = BigInt.zero();
  playerDailyData.cumulatedRoundsPlayed = BigInt.zero();

  if (player.lastBetTimestamp !== null) {
    const lastBetDay = (player.lastBetTimestamp!.toI32() / 86400) * 86400;
    const previousDayData = getPlayerDailyData(
      playerAddress,
      BigInt.fromI32(lastBetDay)
    );
    playerDailyData.cumulatedEthPnL = previousDayData.cumulatedEthPnL;
    playerDailyData.cumulatedLooksPnL = previousDayData.cumulatedLooksPnL;
    playerDailyData.cumulatedUsdPnL = previousDayData.cumulatedUsdPnL;
    playerDailyData.cumulatedRoundsPlayed =
      previousDayData.cumulatedRoundsPlayed;
  }

  playerDailyData.save();

  return playerDailyData;
}

export function getPlayerDailyData(
  playerAddress: string,
  timestamp: BigInt
): PlayerDailyData {
  let today = (timestamp.toI32() / 86400) * 86400;
  let playerDailyDataId = `${playerAddress}-${today}`;
  let playerDailyData = PlayerDailyData.load(playerDailyDataId);
  if (!playerDailyData) {
    playerDailyData = createPlayerDailyData(
      playerAddress,
      BigInt.fromI32(today)
    );
  }

  return playerDailyData;
}

export function updatePlayerDailyData(
  playerAddress: string,
  timestamp: BigInt,
  ethPnL: BigInt,
  looksPnL: BigInt,
  usdPnL: BigInt
): void {
  const dailyData = getPlayerDailyData(playerAddress, timestamp);

  dailyData.ethPnL = dailyData.ethPnL.plus(ethPnL);
  dailyData.looksPnL = dailyData.looksPnL.plus(looksPnL);
  dailyData.usdPnL = dailyData.usdPnL.plus(usdPnL);
  dailyData.roundsPlayed = dailyData.roundsPlayed.plus(BigInt.fromI32(1));

  dailyData.cumulatedEthPnL = dailyData.cumulatedEthPnL.plus(ethPnL);
  dailyData.cumulatedLooksPnL = dailyData.cumulatedLooksPnL.plus(looksPnL);
  dailyData.cumulatedUsdPnL = dailyData.cumulatedUsdPnL.plus(usdPnL);
  dailyData.cumulatedRoundsPlayed = dailyData.cumulatedRoundsPlayed.plus(
    BigInt.fromI32(1)
  );

  dailyData.save();
}
