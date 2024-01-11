import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import {
  CaveAdded as CaveAddedEvent,
  CaveRemoved as CaveRemovedEvent,
  PokeTheBear,
  PrizesClaimed,
  RoundStatusUpdated as RoundStatusUpdatedEvent,
  RoundsEntered as RoundsEnteredEvent
} from '../generated/PokeTheBear/PokeTheBear';
import {
  createCave,
  createPlayerRound,
  getCave,
  getPlayer,
  getGame,
  getRound,
  updatePlayerDailyData
} from './loaders';
import { GameID, RoundStatus } from './enums';
import { convertEthToUSDT, convertLooksToUSDT } from './price-oracle';
import { updatePlayerENSName } from './ens';

export function handleCaveAdded(event: CaveAddedEvent): void {
  let cave = createCave(event.params.caveId.toString());
  cave.enterAmount = event.params.enterAmount;
  cave.currency = event.params.enterCurrency;
  cave.roundDuration = event.params.roundDuration;
  cave.playersPerRound = event.params.playersPerRound;
  cave.protocolFeeBp = event.params.protocolFeeBp;
  cave.prizeAmount = cave.enterAmount
    .times(BigInt.fromI32(10_000 - cave.protocolFeeBp))
    .div(BigInt.fromI32(10_000))
    .div(BigInt.fromI32(cave.playersPerRound - 1));
  cave.feeAmount = cave.enterAmount
    .times(BigInt.fromI32(cave.protocolFeeBp))
    .div(BigInt.fromI32(10_000));

  cave.save();
}

export function handleCaveRemoved(event: CaveRemovedEvent): void {
  let cave = getCave(event.params.caveId.toString());

  cave.isActive = false;

  cave.save();
}

export function handleRoundsEntered(event: RoundsEnteredEvent): void {
  let cave = getCave(event.params.caveId.toString());

  // Create player if it does not exist yet
  let player = getPlayer(event.params.player.toHexString(), true);
  updatePlayerENSName(player);

  let maxRoundId = event.params.startingRoundId.plus(
    event.params.numberOfRounds
  );

  // Save gas fees paid by the player to enter the round
  const feesPaidInETH = event.receipt!.gasUsed.times(
    event.transaction.gasPrice
  );
  const feesPaidInUSD = convertEthToUSDT(feesPaidInETH);

  player.feesPaidInETH = player.feesPaidInETH.plus(feesPaidInETH);
  player.feesPaidInUSD = player.feesPaidInUSD.plus(feesPaidInUSD);

  // Create a round for each round entered starting from startingRoundId
  for (
    let roundId = event.params.startingRoundId;
    roundId.lt(maxRoundId);
    roundId = roundId.plus(BigInt.fromI32(1))
  ) {
    // Create round if it does not exist yet
    let round = getRound(cave.id, roundId.toString(), true);

    // A player cannot enter a round multiple times
    // So we can create this entity every time a round is entered
    const playerRound = createPlayerRound(
      player.id,
      cave.id,
      roundId.toString()
    );

    round.playersCount = round.playersCount.plus(BigInt.fromI32(1));
    round.save();

    player.roundsEnteredCount = player.roundsEnteredCount.plus(
      BigInt.fromI32(1)
    );

    let usdWagered = BigInt.zero();
    if (cave.currency == Address.zero()) {
      player.ethWagered = player.ethWagered.plus(cave.enterAmount);
      usdWagered = convertEthToUSDT(cave.enterAmount);
    } else {
      player.looksWagered = player.looksWagered.plus(cave.enterAmount);
      usdWagered = convertLooksToUSDT(cave.enterAmount);
    }

    player.usdWagered = player.usdWagered.plus(usdWagered);
    playerRound.usdWagered = usdWagered;
    playerRound.feesPaidInETH = feesPaidInETH;
    playerRound.feesPaidInUSD = feesPaidInUSD;
    playerRound.enteredTimestamp = event.block.timestamp;
    playerRound.save();
  }

  player.save();
}

export function handleRoundStatusUpdated(event: RoundStatusUpdatedEvent): void {
  let round = getRound(
    event.params.caveId.toString(),
    event.params.roundId.toString(),
    // status ID 1 means a round has been opened
    event.params.status === 1
  );

  if (event.params.status === 1) {
    round.openedTimestamp = event.block.timestamp;
    round.save();
  }

  if (event.params.status < 4) {
    return;
  }

  let cave = getCave(round.cave);
  const game = getGame(GameID.PTB);
  round.closedTimestamp = event.block.timestamp;

  // Round has been revealed and loser has been selected
  if (event.params.status === 4) {
    game.roundsPlayed = game.roundsPlayed.plus(BigInt.fromI32(1));
    if (cave.currency == Address.zero()) {
      game.ethEarned = game.ethEarned.plus(cave.feeAmount);
      game.usdEarned = game.usdEarned.plus(convertEthToUSDT(cave.feeAmount));
    } else {
      game.looksEarned = game.looksEarned.plus(cave.feeAmount);
      game.usdEarned = game.usdEarned.plus(convertLooksToUSDT(cave.feeAmount));
    }

    let contract = PokeTheBear.bind(event.address);
    let roundData = contract.getRound(
      event.params.caveId,
      event.params.roundId
    );
    let loserIndex = roundData.value6.findIndex(player => player.isLoser);
    let loserAddress = roundData.value6[loserIndex].addr.toHexString();
    let playerRounds = round.players.load();
    for (let i = 0; i < playerRounds.length; i++) {
      const playerRound = playerRounds[i];
      game.usdVolume = game.usdVolume.plus(playerRound.usdWagered);
      const player = getPlayer(playerRound.player);
      // If a loser has been selected save it
      if (player.id == loserAddress) {
        round.loser = player.id;
        player.usdLost = player.usdLost.plus(playerRound.usdWagered);
        player.usdPnL = player.usdPnL.minus(playerRound.usdWagered);
        player.roundsLostCount = player.roundsLostCount.plus(BigInt.fromI32(1));
        if (cave.currency == Address.zero()) {
          player.ethLost = player.ethLost.plus(cave.enterAmount);
        } else {
          player.looksLost = player.looksLost.plus(cave.enterAmount);
        }

        updatePlayerDailyData(
          playerRound.player,
          event.block.timestamp,
          cave.currency == Address.zero()
            ? cave.enterAmount.neg()
            : BigInt.zero(),
          cave.currency == Address.zero()
            ? BigInt.zero()
            : cave.enterAmount.neg(),
          playerRound.usdWagered.neg()
        );
      }
      // or else, distribute the prizes to the winning players
      else {
        player.roundsWonCount = player.roundsWonCount.plus(BigInt.fromI32(1));
        let usdToWin = BigInt.zero();
        if (cave.currency == Address.zero()) {
          usdToWin = convertEthToUSDT(cave.prizeAmount);
          player.ethWon = player.ethWon.plus(cave.prizeAmount);
        } else {
          usdToWin = convertLooksToUSDT(cave.prizeAmount);
          player.looksWon = player.looksWon.plus(cave.prizeAmount);
        }

        player.usdWon = player.usdWon.plus(usdToWin);
        player.usdPnL = player.usdPnL.plus(usdToWin);
        updatePlayerDailyData(
          playerRound.player,
          event.block.timestamp,
          cave.currency == Address.zero() ? cave.prizeAmount : BigInt.zero(),
          cave.currency == Address.zero() ? BigInt.zero() : cave.prizeAmount,
          usdToWin
        );
      }

      player.lastBetTimestamp = event.block.timestamp;
      player.save();
    }

    if (round.loser === null) {
      log.critical(
        'Round ID {} from cave ID {} has been revealed but loser has not been picked',
        [event.params.caveId.toString(), event.params.roundId.toString()]
      );
    }

    round.status = RoundStatus.REVEALED;
  }
  // Round has been cancelled
  else if (event.params.status === 5) {
    round.status = RoundStatus.CANCELLED;
    let playerRounds = round.players.load();

    // Subtract the amount wagered for this round from each player's amount
    for (let i = 0; i < playerRounds.length; i++) {
      const playerRound = playerRounds[i];
      const player = getPlayer(playerRound.player);
      player.usdWagered = player.usdWagered.minus(playerRound.usdWagered);
      if (cave.currency == Address.zero()) {
        player.ethWagered = player.ethWagered.minus(cave.enterAmount);
      } else {
        player.looksWagered = player.looksWagered.minus(cave.enterAmount);
      }
      player.save();
    }
  }

  game.save();
  round.save();
}

export function handlePrizesClaimed(event: PrizesClaimed): void {
  const player = getPlayer(event.params.player.toHexString());
  const feesPaidInETH = event.receipt!.gasUsed.times(
    event.transaction.gasPrice
  );
  const feesPaidInUSD = convertEthToUSDT(feesPaidInETH);

  player.feesPaidInETH = player.feesPaidInETH.plus(feesPaidInETH);
  player.feesPaidInUSD = player.feesPaidInUSD.plus(feesPaidInUSD);
  player.save();
}
