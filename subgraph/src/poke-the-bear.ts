import { BigInt } from '@graphprotocol/graph-ts';
import {
  CaveAdded as CaveAddedEvent,
  CaveRemoved as CaveRemovedEvent,
  CommitmentsSubmitted as CommitmentsSubmittedEvent,
  DepositsRefunded as DepositsRefundedEvent,
  DepositsRolledOver as DepositsRolledOverEvent,
  PrizesClaimed as PrizesClaimedEvent,
  ProtocolFeeRecipientUpdated as ProtocolFeeRecipientUpdatedEvent,
  RandomnessRequested as RandomnessRequestedEvent,
  RoundStatusUpdated as RoundStatusUpdatedEvent,
  RoundsCancelled as RoundsCancelledEvent,
  RoundsEntered as RoundsEnteredEvent
} from '../generated/PokeTheBear/PokeTheBear';
import { Cave, Player, PlayerRound, Round } from '../generated/schema';

// TODO estimate the oracle fees every time a VRF call is made https://docs.chain.link/vrf/v2/estimating-costs?network=ethereum-mainnet
export function handleCaveAdded(event: CaveAddedEvent): void {
  let cave = new Cave(event.params.caveId.toString());
  cave.enterAmount = event.params.enterAmount;
  cave.enterCurrency = event.params.enterCurrency;
  cave.roundDuration = event.params.roundDuration;
  cave.playersPerRound = event.params.playersPerRound;
  cave.protocolFeeBp = event.params.protocolFeeBp;
  cave.isActive = true;
  cave.roundsCount = new BigInt(0);
  cave.maintenanceCost = new BigInt(0);

  cave.save();
}

export function handleCaveRemoved(event: CaveRemovedEvent): void {
  let cave = Cave.load(event.params.caveId.toString())!;

  cave.isActive = false;

  cave.save();
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
