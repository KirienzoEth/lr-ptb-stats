import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach
} from 'matchstick-as/assembly/index';
import { BigInt, Address } from '@graphprotocol/graph-ts';
import {
  handleCaveAdded,
  handleCaveRemoved,
  handleRoundsEntered
} from '../src/poke-the-bear';
import {
  createCaveAddedEvent,
  createCaveRemovedEvent,
  createRoundsEnteredEvent
} from './poke-the-bear-utils';
import { Cave, Player, PlayerRound } from '../generated/schema';

afterEach(() => {
  clearStore();
});

describe('handleCaveAdded', () => {
  beforeEach(() => {
    let caveId = BigInt.fromI32(1);
    let enterAmount = BigInt.fromI32(10000000);
    let enterCurrency = Address.fromString(
      '0x1111111111111111111111111111111111111111'
    );
    let roundDuration = BigInt.fromI32(600);
    let playersPerRound = 10;
    let protocolFeeBp = 50;
    let newCaveAddedEvent = createCaveAddedEvent(
      caveId,
      enterAmount,
      enterCurrency,
      roundDuration,
      playersPerRound,
      protocolFeeBp
    );
    handleCaveAdded(newCaveAddedEvent);
  });
  test('CaveAdded created and stored', () => {
    assert.entityCount('Cave', 1);
    let cave = Cave.load('1')!;
    assert.bigIntEquals(cave.enterAmount, BigInt.fromI32(10000000));
    assert.stringEquals(
      cave.enterCurrency.toHexString(),
      '0x1111111111111111111111111111111111111111'
    );
    assert.bigIntEquals(cave.roundDuration, BigInt.fromI32(600));
    assert.i32Equals(cave.playersPerRound, 10);
    assert.i32Equals(cave.protocolFeeBp, 50);
    assert.assertTrue(cave.isActive);
  });
});

describe('handleCaveRemoved', () => {
  beforeEach(() => {
    let newCaveAddedEvent = createCaveAddedEvent(
      BigInt.fromI32(1),
      BigInt.fromI32(10000000),
      Address.fromString('0x1111111111111111111111111111111111111111'),
      BigInt.fromI32(600),
      10,
      50
    );
    let newCaveRemovedEvent = createCaveRemovedEvent(BigInt.fromI32(1));
    handleCaveAdded(newCaveAddedEvent);
    handleCaveRemoved(newCaveRemovedEvent);
  });
  test('Should set the cave isACtive attribute to false', () => {
    assert.entityCount('Cave', 1);

    assert.fieldEquals('Cave', '1', 'isActive', 'false');
  });
});

describe('handleRoundsEntered', () => {
  beforeEach(() => {
    let looksCaveAddedEvent = createCaveAddedEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(10000000),
      Address.fromString('0x1111111111111111111111111111111111111111'),
      BigInt.fromI32(600),
      10,
      50
    );
    handleCaveAdded(looksCaveAddedEvent);
    let ethCaveAddedEvent = createCaveAddedEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(50000000),
      Address.zero(),
      BigInt.fromI32(600),
      10,
      50
    );
    handleCaveAdded(ethCaveAddedEvent);
  });
  test('Should create a new round, player and playerRound', () => {
    let newRoundsEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      BigInt.fromI32(1),
      Address.fromString('0x0000000000000000000000000000000000000123')
    );
    handleRoundsEntered(newRoundsEnteredEvent);

    assert.entityCount('Round', 1);
    assert.fieldEquals('Round', '3-1', 'cave', '3');

    assert.entityCount('Player', 1);
    let player = Player.load('0x0000000000000000000000000000000000000123')!;
    assert.bigIntEquals(player.looksWagered, BigInt.fromI32(10000000));
    assert.bigIntEquals(player.ethWagered, BigInt.zero());
    assert.bigIntEquals(player.roundsEnteredCount, BigInt.fromI32(1));

    assert.entityCount('PlayerRound', 1);
    let playerRound = PlayerRound.load(
      '0x0000000000000000000000000000000000000123-3-1'
    )!;
    assert.stringEquals(
      playerRound.player,
      '0x0000000000000000000000000000000000000123'
    );
    assert.stringEquals(playerRound.cave, '3');
    assert.stringEquals(playerRound.round, '3-1');
    assert.bigIntEquals(playerRound.gemsEarned, BigInt.zero());
  });
  test('Should increase amount of eth wagered if cave\'s currency is the 0 address', () => {
    let newRoundsEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(1),
      BigInt.fromI32(1),
      Address.fromString('0x0000000000000000000000000000000000000321')
    );
    handleRoundsEntered(newRoundsEnteredEvent);

    assert.entityCount('Player', 1);
    let player = Player.load('0x0000000000000000000000000000000000000321')!;
    assert.bigIntEquals(player.looksWagered, BigInt.zero());
    assert.bigIntEquals(player.ethWagered, BigInt.fromI32(50000000));
  });
  test('Should accumulate rounds data if several rounds are entered at once', () => {
    let newRoundsEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(1),
      BigInt.fromI32(3),
      Address.fromString('0x0000000000000000000000000000000000000321')
    );
    handleRoundsEntered(newRoundsEnteredEvent);

    assert.entityCount('Round', 3);
    assert.entityCount('Player', 1);
    let player = Player.load('0x0000000000000000000000000000000000000321')!;
    assert.bigIntEquals(player.ethWagered, BigInt.fromI32(150000000));
    assert.bigIntEquals(player.roundsEnteredCount, BigInt.fromI32(3));

    assert.entityCount('PlayerRound', 3);
    let playerRound = PlayerRound.load(
      '0x0000000000000000000000000000000000000321-4-1'
    );
    assert.assertNotNull(playerRound);
    playerRound = PlayerRound.load(
      '0x0000000000000000000000000000000000000321-4-2'
    );
    assert.assertNotNull(playerRound);
    playerRound = PlayerRound.load(
      '0x0000000000000000000000000000000000000321-4-3'
    );
    assert.assertNotNull(playerRound);
  });
  test('Should save data for each player that entered', () => {
    let newRoundsEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(1),
      BigInt.fromI32(1),
      Address.fromString('0x0000000000000000000000000000000000000321')
    );
    handleRoundsEntered(newRoundsEnteredEvent);
    newRoundsEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(1),
      BigInt.fromI32(2),
      Address.fromString('0x0000000000000000000000000000000000000654')
    );
    handleRoundsEntered(newRoundsEnteredEvent);
    newRoundsEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(1),
      BigInt.fromI32(1),
      Address.fromString('0x0000000000000000000000000000000000000987')
    );
    handleRoundsEntered(newRoundsEnteredEvent);

    assert.entityCount('Round', 2);
    assert.entityCount('Player', 3);
    let player = Player.load('0x0000000000000000000000000000000000000321')!;
    assert.bigIntEquals(player.ethWagered, BigInt.fromI32(50000000));
    assert.bigIntEquals(player.roundsEnteredCount, BigInt.fromI32(1));
    player = Player.load('0x0000000000000000000000000000000000000654')!;
    assert.bigIntEquals(player.ethWagered, BigInt.fromI32(100000000));
    assert.bigIntEquals(player.roundsEnteredCount, BigInt.fromI32(2));
    player = Player.load('0x0000000000000000000000000000000000000987')!;
    assert.bigIntEquals(player.ethWagered, BigInt.fromI32(50000000));
    assert.bigIntEquals(player.roundsEnteredCount, BigInt.fromI32(1));

    assert.entityCount('PlayerRound', 4);
    let playerRound = PlayerRound.load(
      '0x0000000000000000000000000000000000000321-4-1'
    );
    assert.assertNotNull(playerRound);
    playerRound = PlayerRound.load(
      '0x0000000000000000000000000000000000000654-4-1'
    );
    assert.assertNotNull(playerRound);
    playerRound = PlayerRound.load(
      '0x0000000000000000000000000000000000000654-4-2'
    );
    assert.assertNotNull(playerRound);
    playerRound = PlayerRound.load(
      '0x0000000000000000000000000000000000000987-4-1'
    );
    assert.assertNotNull(playerRound);
  });
});
