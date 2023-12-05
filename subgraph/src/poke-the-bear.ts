import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import {
  CaveAdded as CaveAddedEvent,
  CaveRemoved as CaveRemovedEvent,
  CommitmentsSubmitted as CommitmentsSubmittedEvent,
  DepositsRefunded as DepositsRefundedEvent,
  DepositsRolledOver as DepositsRolledOverEvent,
  PokeTheBear,
  PrizesClaimed as PrizesClaimedEvent,
  ProtocolFeeRecipientUpdated as ProtocolFeeRecipientUpdatedEvent,
  RandomnessRequested as RandomnessRequestedEvent,
  RoundStatusUpdated as RoundStatusUpdatedEvent,
  RoundsCancelled as RoundsCancelledEvent,
  RoundsEntered as RoundsEnteredEvent
} from '../generated/PokeTheBear/PokeTheBear';
import {
  createCave,
  createPlayerRound,
  getCave,
  getPlayer,
  getRound
} from './loaders';
import { RoundStatus } from './enums';

export function handleCaveAdded(event: CaveAddedEvent): void {
  let cave = createCave(event.params.caveId.toString());
  cave.enterAmount = event.params.enterAmount;
  cave.enterCurrency = event.params.enterCurrency;
  cave.roundDuration = event.params.roundDuration;
  cave.playersPerRound = event.params.playersPerRound;
  cave.protocolFeeBp = event.params.protocolFeeBp;

  cave.save();
}

export function handleCaveRemoved(event: CaveRemovedEvent): void {
  let cave = getCave(event.params.caveId.toString());

  cave.isActive = false;

  cave.save();
}

// TODO estimate the oracle fees every time a VRF call is made https://docs.chain.link/vrf/v2/estimating-costs?network=ethereum-mainnet
export function handleRoundsEntered(event: RoundsEnteredEvent): void {
  let cave = getCave(event.params.caveId.toString());

  // Create player if it does not exist yet
  let player = getPlayer(event.params.player.toHexString(), true);

  let maxRoundId = event.params.startingRoundId.plus(
    event.params.numberOfRounds
  );
  for (
    let roundId = event.params.startingRoundId;
    roundId.lt(maxRoundId);
    roundId = roundId.plus(BigInt.fromI32(1))
  ) {
    // Create round if it does not exist yet
    let round = getRound(cave.id, roundId.toString(), true);

    // A player cannot enter a round multiple times
    // So we can create this entity every time a round is entered
    createPlayerRound(player.id, cave.id, roundId.toString());

    round.playersCount = round.playersCount.plus(BigInt.fromI32(1));
    round.save();

    player.roundsEnteredCount = player.roundsEnteredCount.plus(
      BigInt.fromI32(1)
    );
    if (cave.enterCurrency == Address.zero()) {
      player.ethWagered = player.ethWagered.plus(cave.enterAmount);
    } else {
      player.looksWagered = player.looksWagered.plus(cave.enterAmount);
    }
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

  if (event.params.status < 4) {
    return;
  }

  let cave = getCave(round.cave);

  // Round has been revealed and loser has been selected
  if (event.params.status === 4) {
    let contract = PokeTheBear.bind(event.address);
    let roundData = contract.getRound(
      event.params.caveId,
      event.params.roundId
    );
    let players = roundData.value6;
    for (let i = 0; i < players.length; i++) {
      const player = getPlayer(players[i].addr.toHexString());
      // If a loser has been selected save it
      if (players[i].isLoser) {
        round.loser = player.id;
        player.roundsLostCount = player.roundsLostCount.plus(BigInt.fromI32(1));
        // or else, distribute the prizes to the winning players
      } else {
        player.roundsWonCount = player.roundsWonCount.plus(BigInt.fromI32(1));
        if (cave.enterCurrency == Address.zero()) {
          player.ethWon = player.ethWon.plus(
            cave.enterAmount
              .times(BigInt.fromI32(10_000 - cave.protocolFeeBp))
              .div(BigInt.fromI32(10_000))
              .div(BigInt.fromI32(cave.playersPerRound - 1))
          );
        } else {
          player.looksWon = player.looksWon.plus(
            cave.enterAmount
              .times(BigInt.fromI32(10_000 - cave.protocolFeeBp))
              .div(BigInt.fromI32(10_000))
              .div(BigInt.fromI32(cave.playersPerRound - 1))
          );
        }
      }

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
      if (cave.enterCurrency == Address.zero()) {
        player.ethWagered = player.ethWagered.minus(cave.enterAmount);
      } else {
        player.looksWagered = player.looksWagered.minus(cave.enterAmount);
      }
      player.save();
    }
  }

  round.save();
}
/*
export function handleCommitmentsSubmitted(
  event: CommitmentsSubmittedEvent
): void {
  let entity = new CommitmentsSubmitted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.commitments = event.params.commitments

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDepositsRefunded(event: DepositsRefundedEvent): void {
  let entity = new DepositsRefunded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.deposits = event.params.deposits
  entity.player = event.params.player

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDepositsRolledOver(event: DepositsRolledOverEvent): void {
  let entity = new DepositsRolledOver(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.rollovers = event.params.rollovers
  entity.player = event.params.player

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePrizesClaimed(event: PrizesClaimedEvent): void {
  let entity = new PrizesClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.prizes = event.params.prizes
  entity.player = event.params.player

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProtocolFeeRecipientUpdated(
  event: ProtocolFeeRecipientUpdatedEvent
): void {
  let entity = new ProtocolFeeRecipientUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.protocolFeeRecipient = event.params.protocolFeeRecipient

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRandomnessRequested(
  event: RandomnessRequestedEvent
): void {
  let entity = new RandomnessRequested(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caveId = event.params.caveId
  entity.roundId = event.params.roundId
  entity.requestId = event.params.requestId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoundStatusUpdated(event: RoundStatusUpdatedEvent): void {
  let entity = new RoundStatusUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caveId = event.params.caveId
  entity.roundId = event.params.roundId
  entity.status = event.params.status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoundsCancelled(event: RoundsCancelledEvent): void {
  let entity = new RoundsCancelled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caveId = event.params.caveId
  entity.startingRoundId = event.params.startingRoundId
  entity.numberOfRounds = event.params.numberOfRounds

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
*/
