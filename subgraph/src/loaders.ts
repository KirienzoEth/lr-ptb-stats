import { Cave, Player, PlayerRound, Round } from '../generated/schema';
import { Address, BigInt, log } from '@graphprotocol/graph-ts';

export function createRound(roundId: string, caveId: string): Round {
  let round = new Round(caveId + '-' + roundId);
  round.cave = caveId;
  round.roundId = roundId;
  round.save();

  return round;
}

export function getRound(
  roundId: string,
  caveId: string,
  insertIfNotExist: bool = false
): Round {
  let round = Round.load(caveId + '-' + roundId);
  if (!round && insertIfNotExist) {
    round = createRound(roundId, caveId);
  } else if (!round) {
    log.critical('Round ID {} from cave ID {} was not found', [
      roundId,
      caveId
    ]);
    throw new Error();
  }

  return round;
}

export function createPlayer(playerAddress: string): Player {
  let player = new Player(playerAddress);
  player.looksWagered = new BigInt(0);
  player.ethWagered = new BigInt(0);
  player.looksWon = new BigInt(0);
  player.ethWon = new BigInt(0);
  player.roundsEnteredCount = new BigInt(0);
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
    log.critical('Player with address {} was not found', [playerAddress]);
    throw new Error();
  }

  return player;
}

export function createCave(caveId: string): Cave {
  let cave = new Cave(caveId);
  cave.enterAmount = new BigInt(0);
  cave.enterCurrency = Address.zero();
  cave.roundDuration = new BigInt(0);
  cave.playersPerRound = 0;
  cave.protocolFeeBp = 0;
  cave.isActive = true;
  cave.roundsCount = new BigInt(0);
  cave.maintenanceCost = new BigInt(0);
  cave.save();

  return cave;
}

export function getCave(caveId: string): Cave {
  let cave = Cave.load(caveId);
  if (!cave) {
    log.critical('Cave ID {} was not found', [caveId]);
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
  playerRound.gemsEarned = new BigInt(0);
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
    log.critical('player round ID {} was not found', [playerRoundId]);
    throw new Error();
  }

  return playerRound;
}
