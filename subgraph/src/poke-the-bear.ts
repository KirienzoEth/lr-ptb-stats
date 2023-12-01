import {
  CaveAdded as CaveAddedEvent,
  CaveRemoved as CaveRemovedEvent,
  CommitmentsSubmitted as CommitmentsSubmittedEvent,
  DepositsRefunded as DepositsRefundedEvent,
  DepositsRolledOver as DepositsRolledOverEvent,
  Paused as PausedEvent,
  PrizesClaimed as PrizesClaimedEvent,
  ProtocolFeeRecipientUpdated as ProtocolFeeRecipientUpdatedEvent,
  RandomnessRequested as RandomnessRequestedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  RoundStatusUpdated as RoundStatusUpdatedEvent,
  RoundsCancelled as RoundsCancelledEvent,
  RoundsEntered as RoundsEnteredEvent,
  Unpaused as UnpausedEvent
} from "../generated/PokeTheBear/PokeTheBear"
import {
  CaveAdded,
  CaveRemoved,
  CommitmentsSubmitted,
  DepositsRefunded,
  DepositsRolledOver,
  Paused,
  PrizesClaimed,
  ProtocolFeeRecipientUpdated,
  RandomnessRequested,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  RoundStatusUpdated,
  RoundsCancelled,
  RoundsEntered,
  Unpaused
} from "../generated/schema"

export function handleCaveAdded(event: CaveAddedEvent): void {
  let entity = new CaveAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caveId = event.params.caveId
  entity.enterAmount = event.params.enterAmount
  entity.enterCurrency = event.params.enterCurrency
  entity.roundDuration = event.params.roundDuration
  entity.playersPerRound = event.params.playersPerRound
  entity.protocolFeeBp = event.params.protocolFeeBp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCaveRemoved(event: CaveRemovedEvent): void {
  let entity = new CaveRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caveId = event.params.caveId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

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

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

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

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

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

export function handleRoundsEntered(event: RoundsEnteredEvent): void {
  let entity = new RoundsEntered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.caveId = event.params.caveId
  entity.startingRoundId = event.params.startingRoundId
  entity.numberOfRounds = event.params.numberOfRounds
  entity.player = event.params.player

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
