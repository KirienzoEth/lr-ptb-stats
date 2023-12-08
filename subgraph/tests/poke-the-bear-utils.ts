import { createMockedFunction, newMockEvent } from 'matchstick-as';
import { ethereum, BigInt, Address, Bytes } from '@graphprotocol/graph-ts';
import {
  CaveAdded,
  CaveRemoved,
  CommitmentsSubmitted,
  DepositsRefunded,
  DepositsRolledOver,
  PrizesClaimed,
  ProtocolFeeRecipientUpdated,
  RandomnessRequested,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  RoundStatusUpdated,
  RoundsCancelled,
  RoundsEntered
} from '../generated/PokeTheBear/PokeTheBear';
import {
  looksTokenAddress,
  priceOracleAddress,
  usdtTokenAddress
} from '../src/price-oracle';

export function createCaveAddedEvent(
  caveId: BigInt,
  enterAmount: BigInt,
  enterCurrency: Address,
  roundDuration: BigInt,
  playersPerRound: i32,
  protocolFeeBp: i32
): CaveAdded {
  let caveAddedEvent = changetype<CaveAdded>(newMockEvent());

  caveAddedEvent.parameters = new Array();

  caveAddedEvent.parameters.push(
    new ethereum.EventParam('caveId', ethereum.Value.fromUnsignedBigInt(caveId))
  );
  caveAddedEvent.parameters.push(
    new ethereum.EventParam(
      'enterAmount',
      ethereum.Value.fromUnsignedBigInt(enterAmount)
    )
  );
  caveAddedEvent.parameters.push(
    new ethereum.EventParam(
      'enterCurrency',
      ethereum.Value.fromAddress(enterCurrency)
    )
  );
  caveAddedEvent.parameters.push(
    new ethereum.EventParam(
      'roundDuration',
      ethereum.Value.fromUnsignedBigInt(roundDuration)
    )
  );
  caveAddedEvent.parameters.push(
    new ethereum.EventParam(
      'playersPerRound',
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(playersPerRound))
    )
  );
  caveAddedEvent.parameters.push(
    new ethereum.EventParam(
      'protocolFeeBp',
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(protocolFeeBp))
    )
  );

  return caveAddedEvent;
}

export function createCaveRemovedEvent(caveId: BigInt): CaveRemoved {
  let caveRemovedEvent = changetype<CaveRemoved>(newMockEvent());

  caveRemovedEvent.parameters = new Array();

  caveRemovedEvent.parameters.push(
    new ethereum.EventParam('caveId', ethereum.Value.fromUnsignedBigInt(caveId))
  );

  return caveRemovedEvent;
}

export function createCommitmentsSubmittedEvent(
  commitments: Array<ethereum.Tuple>
): CommitmentsSubmitted {
  let commitmentsSubmittedEvent = changetype<CommitmentsSubmitted>(
    newMockEvent()
  );

  commitmentsSubmittedEvent.parameters = new Array();

  commitmentsSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      'commitments',
      ethereum.Value.fromTupleArray(commitments)
    )
  );

  return commitmentsSubmittedEvent;
}

export function createDepositsRefundedEvent(
  deposits: Array<ethereum.Tuple>,
  player: Address
): DepositsRefunded {
  let depositsRefundedEvent = changetype<DepositsRefunded>(newMockEvent());

  depositsRefundedEvent.parameters = new Array();

  depositsRefundedEvent.parameters.push(
    new ethereum.EventParam('deposits', ethereum.Value.fromTupleArray(deposits))
  );
  depositsRefundedEvent.parameters.push(
    new ethereum.EventParam('player', ethereum.Value.fromAddress(player))
  );

  return depositsRefundedEvent;
}

export function createDepositsRolledOverEvent(
  rollovers: Array<ethereum.Tuple>,
  player: Address
): DepositsRolledOver {
  let depositsRolledOverEvent = changetype<DepositsRolledOver>(newMockEvent());

  depositsRolledOverEvent.parameters = new Array();

  depositsRolledOverEvent.parameters.push(
    new ethereum.EventParam(
      'rollovers',
      ethereum.Value.fromTupleArray(rollovers)
    )
  );
  depositsRolledOverEvent.parameters.push(
    new ethereum.EventParam('player', ethereum.Value.fromAddress(player))
  );

  return depositsRolledOverEvent;
}

export function createPrizesClaimedEvent(
  prizes: Array<ethereum.Tuple>,
  player: Address
): PrizesClaimed {
  let prizesClaimedEvent = changetype<PrizesClaimed>(newMockEvent());

  prizesClaimedEvent.parameters = new Array();

  prizesClaimedEvent.parameters.push(
    new ethereum.EventParam('prizes', ethereum.Value.fromTupleArray(prizes))
  );
  prizesClaimedEvent.parameters.push(
    new ethereum.EventParam('player', ethereum.Value.fromAddress(player))
  );

  return prizesClaimedEvent;
}

export function createProtocolFeeRecipientUpdatedEvent(
  protocolFeeRecipient: Address
): ProtocolFeeRecipientUpdated {
  let protocolFeeRecipientUpdatedEvent = changetype<
    ProtocolFeeRecipientUpdated
  >(newMockEvent());

  protocolFeeRecipientUpdatedEvent.parameters = new Array();

  protocolFeeRecipientUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      'protocolFeeRecipient',
      ethereum.Value.fromAddress(protocolFeeRecipient)
    )
  );

  return protocolFeeRecipientUpdatedEvent;
}

export function createRandomnessRequestedEvent(
  caveId: BigInt,
  roundId: BigInt,
  requestId: BigInt
): RandomnessRequested {
  let randomnessRequestedEvent = changetype<RandomnessRequested>(
    newMockEvent()
  );

  randomnessRequestedEvent.parameters = new Array();

  randomnessRequestedEvent.parameters.push(
    new ethereum.EventParam('caveId', ethereum.Value.fromUnsignedBigInt(caveId))
  );
  randomnessRequestedEvent.parameters.push(
    new ethereum.EventParam(
      'roundId',
      ethereum.Value.fromUnsignedBigInt(roundId)
    )
  );
  randomnessRequestedEvent.parameters.push(
    new ethereum.EventParam(
      'requestId',
      ethereum.Value.fromUnsignedBigInt(requestId)
    )
  );

  return randomnessRequestedEvent;
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent());

  roleAdminChangedEvent.parameters = new Array();

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam('role', ethereum.Value.fromFixedBytes(role))
  );
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      'previousAdminRole',
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  );
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      'newAdminRole',
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  );

  return roleAdminChangedEvent;
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent());

  roleGrantedEvent.parameters = new Array();

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam('role', ethereum.Value.fromFixedBytes(role))
  );
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  );
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam('sender', ethereum.Value.fromAddress(sender))
  );

  return roleGrantedEvent;
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent());

  roleRevokedEvent.parameters = new Array();

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam('role', ethereum.Value.fromFixedBytes(role))
  );
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  );
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam('sender', ethereum.Value.fromAddress(sender))
  );

  return roleRevokedEvent;
}

export function createRoundStatusUpdatedEvent(
  caveId: BigInt,
  roundId: BigInt,
  status: i32
): RoundStatusUpdated {
  let roundStatusUpdatedEvent = changetype<RoundStatusUpdated>(newMockEvent());

  roundStatusUpdatedEvent.parameters = new Array();

  roundStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam('caveId', ethereum.Value.fromUnsignedBigInt(caveId))
  );
  roundStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      'roundId',
      ethereum.Value.fromUnsignedBigInt(roundId)
    )
  );
  roundStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      'status',
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  );

  return roundStatusUpdatedEvent;
}

export function createRoundsCancelledEvent(
  caveId: BigInt,
  startingRoundId: BigInt,
  numberOfRounds: BigInt
): RoundsCancelled {
  let roundsCancelledEvent = changetype<RoundsCancelled>(newMockEvent());

  roundsCancelledEvent.parameters = new Array();

  roundsCancelledEvent.parameters.push(
    new ethereum.EventParam('caveId', ethereum.Value.fromUnsignedBigInt(caveId))
  );
  roundsCancelledEvent.parameters.push(
    new ethereum.EventParam(
      'startingRoundId',
      ethereum.Value.fromUnsignedBigInt(startingRoundId)
    )
  );
  roundsCancelledEvent.parameters.push(
    new ethereum.EventParam(
      'numberOfRounds',
      ethereum.Value.fromUnsignedBigInt(numberOfRounds)
    )
  );

  return roundsCancelledEvent;
}

export function createRoundsEnteredEvent(
  caveId: BigInt,
  startingRoundId: BigInt,
  numberOfRounds: BigInt,
  player: Address
): RoundsEntered {
  let roundsEnteredEvent = changetype<RoundsEntered>(newMockEvent());

  roundsEnteredEvent.parameters = new Array();

  roundsEnteredEvent.parameters.push(
    new ethereum.EventParam('caveId', ethereum.Value.fromUnsignedBigInt(caveId))
  );
  roundsEnteredEvent.parameters.push(
    new ethereum.EventParam(
      'startingRoundId',
      ethereum.Value.fromUnsignedBigInt(startingRoundId)
    )
  );
  roundsEnteredEvent.parameters.push(
    new ethereum.EventParam(
      'numberOfRounds',
      ethereum.Value.fromUnsignedBigInt(numberOfRounds)
    )
  );
  roundsEnteredEvent.parameters.push(
    new ethereum.EventParam('player', ethereum.Value.fromAddress(player))
  );

  return roundsEnteredEvent;
}

/**
 * Mock the contract call to GetRound
 * @dev Add more parameters to this function as the need evolves
 */
export function mockGetRoundCall(caveId: string, roundId: string): void {
  // Couldn't find a better way to do it that is accepted by the compiler
  // prettier-ignore
  const playerIndices = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  const player1Tuple = new ethereum.Tuple(3);
  player1Tuple[0] = ethereum.Value.fromAddress(
    Address.fromString('0x0000000000000000000000000000000000000123')
  );
  player1Tuple[1] = ethereum.Value.fromBoolean(true);
  player1Tuple[2] = ethereum.Value.fromBoolean(false);

  const player2Tuple = new ethereum.Tuple(3);
  player2Tuple[0] = ethereum.Value.fromAddress(
    Address.fromString('0x0000000000000000000000000000000000000456')
  );
  player2Tuple[1] = ethereum.Value.fromBoolean(false);
  player2Tuple[2] = ethereum.Value.fromBoolean(false);
  createMockedFunction(
    Address.fromString('0xa16081f360e3847006db660bae1c6d1b2e17ec2a'),
    'getRound',
    'getRound(uint256,uint256):(uint8,uint40,uint40,bytes32,bytes32,uint8[32],(address,bool,bool)[])'
  )
    .withArgs([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(caveId)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(roundId))
    ])
    .returns([
      ethereum.Value.fromSignedBigInt(BigInt.fromI32(4)),
      ethereum.Value.fromSignedBigInt(BigInt.zero()),
      ethereum.Value.fromSignedBigInt(BigInt.zero()),
      ethereum.Value.fromBytes(Bytes.empty()),
      ethereum.Value.fromBytes(Bytes.empty()),
      ethereum.Value.fromI32Array(playerIndices),
      ethereum.Value.fromTupleArray([player1Tuple, player2Tuple])
    ]);
}

export function mockPriceOracleCalls(amountToReturn: BigInt): void {
  createMockedFunction(
    priceOracleAddress,
    'getTWAP',
    'getTWAP(address,uint32):(uint256)'
  )
    .withArgs([
      ethereum.Value.fromAddress(looksTokenAddress),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))
    ])
    .returns([ethereum.Value.fromUnsignedBigInt(amountToReturn)]);

  createMockedFunction(
    priceOracleAddress,
    'getTWAP',
    'getTWAP(address,uint32):(uint256)'
  )
    .withArgs([
      ethereum.Value.fromAddress(usdtTokenAddress),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))
    ])
    .returns([ethereum.Value.fromUnsignedBigInt(amountToReturn)]);
}
