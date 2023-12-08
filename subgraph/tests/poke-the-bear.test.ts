import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach
} from 'matchstick-as/assembly/index';
import { BigInt, Address, log, ethereum, Bytes } from '@graphprotocol/graph-ts';
import {
  handleCaveAdded,
  handleCaveRemoved,
  handleRoundStatusUpdated,
  handleRoundsEntered
} from '../src/poke-the-bear';
import {
  createCaveAddedEvent,
  createCaveRemovedEvent,
  createRoundStatusUpdatedEvent,
  createRoundsEnteredEvent,
  mockGetRoundCall,
  mockPriceOracleCalls
} from './poke-the-bear-utils';
import { Cave, Player, PlayerRound, Round } from '../generated/schema';
import { RoundStatus } from '../src/enums';
import {
  createCave,
  createPlayer,
  createPlayerRound,
  getCave,
  getPlayer,
  getPlayerRound,
  getRound
} from '../src/loaders';
import { looksTokenAddress } from '../src/price-oracle';

afterEach(() => {
  clearStore();
});

describe('handleCaveAdded', () => {
  beforeEach(() => {
    let caveId = BigInt.fromI32(1);
    let enterAmount = BigInt.fromI32(10000000);
    let currency = Address.fromString(
      '0x1111111111111111111111111111111111111111'
    );
    let roundDuration = BigInt.fromI32(600);
    let playersPerRound = 10;
    let protocolFeeBp = 50;
    let newCaveAddedEvent = createCaveAddedEvent(
      caveId,
      enterAmount,
      currency,
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
      cave.currency.toHexString(),
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
      3,
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
    let round = Round.load('3-1')!;
    assert.stringEquals(round.cave, '3');
    assert.bigIntEquals(round.roundId, BigInt.fromI32(1));
    assert.stringEquals(round.status, RoundStatus.OPEN);
    assert.bigIntEquals(round.playersCount, BigInt.fromI32(1));

    assert.entityCount('Player', 1);
    let player = Player.load('0x0000000000000000000000000000000000000123')!;
    assert.bigIntEquals(player.looksWagered, BigInt.fromI32(10000000));
    assert.bigIntEquals(player.ethWagered, BigInt.zero());
    assert.bigIntEquals(player.ethWon, BigInt.zero());
    assert.bigIntEquals(player.looksWon, BigInt.zero());
    assert.bigIntEquals(player.ethLost, BigInt.zero());
    assert.bigIntEquals(player.ethWon, BigInt.zero());
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
    let round = Round.load('4-1')!;
    assert.bigIntEquals(round.playersCount, BigInt.fromI32(3));
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
describe('handleRoundStatusUpdated', () => {
  beforeEach(() => {
    // ETH cave
    const ethCave = createCave('3');
    ethCave.enterAmount = BigInt.fromI32(10_000_000);
    ethCave.prizeAmount = BigInt.fromI32(9_500_000);
    ethCave.playersPerRound = 2;
    ethCave.protocolFeeBp = 50;
    ethCave.save();

    // Looks cave
    const looksCave = createCave('4');
    looksCave.enterAmount = BigInt.fromI32(10_000_000);
    looksCave.prizeAmount = BigInt.fromI32(9_500_000);
    looksCave.currency = looksTokenAddress;
    looksCave.playersPerRound = 2;
    looksCave.protocolFeeBp = 50;
    looksCave.save();

    let roundsOpenedEvent = createRoundStatusUpdatedEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      // 1 == Round opened
      1
    );
    handleRoundStatusUpdated(roundsOpenedEvent);
    roundsOpenedEvent = createRoundStatusUpdatedEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(1),
      // 1 == Round opened
      1
    );
    handleRoundStatusUpdated(roundsOpenedEvent);
    const player1 = createPlayer('0x0000000000000000000000000000000000000123');
    player1.ethWagered = ethCave.enterAmount;
    player1.looksWagered = looksCave.enterAmount;
    player1.roundsEnteredCount = BigInt.fromI32(2);
    const player2 = createPlayer('0x0000000000000000000000000000000000000456');
    player2.roundsEnteredCount = BigInt.fromI32(3);
    player1.looksWagered = looksCave.enterAmount;
    player2.ethWagered = ethCave.enterAmount.times(BigInt.fromI32(2));

    player1.save();
    player2.save();

    createPlayerRound(player1.id, ethCave.id, '1');
    createPlayerRound(player2.id, ethCave.id, '1');
    createPlayerRound(player1.id, looksCave.id, '1');
    createPlayerRound(player2.id, looksCave.id, '1');
  });
  test('Should create a new round when status is 1', () => {
    assert.entityCount('Round', 2);
    let round = Round.load('3-1')!;
    assert.stringEquals(round.cave, '3');
    assert.bigIntEquals(round.roundId, BigInt.fromI32(1));
    assert.stringEquals(round.status, RoundStatus.OPEN);
    assert.bigIntEquals(round.playersCount, BigInt.zero());
    round = Round.load('4-1')!;
    assert.stringEquals(round.cave, '4');
    assert.bigIntEquals(round.roundId, BigInt.fromI32(1));
    assert.stringEquals(round.status, RoundStatus.OPEN);
    assert.bigIntEquals(round.playersCount, BigInt.zero());
  });
  test(
    'Should throw an error if the status is not 1 and round does not exist',
    () => {
      let roundsRevealedEvent = createRoundStatusUpdatedEvent(
        BigInt.fromI32(3),
        BigInt.fromI32(2),
        // 4 == round revealed
        4
      );
      handleRoundStatusUpdated(roundsRevealedEvent);
    },
    true
  );
  test('Should cancel the round when status is 5', () => {
    const player1EthWagered = BigInt.fromI32(10_000_000);
    const player2EthWagered = BigInt.fromI32(20_000_000);
    let roundCancelledEvent = createRoundStatusUpdatedEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      5
    );
    handleRoundStatusUpdated(roundCancelledEvent);

    let round = Round.load('3-1')!;
    assert.stringEquals(round.status, RoundStatus.CANCELLED);

    const playerRounds = round.players.load();
    assert.i32Equals(playerRounds.length, 2);

    const caveEntryFee = getCave(round.cave).enterAmount;
    const player1 = getPlayer('0x0000000000000000000000000000000000000123');
    assert.bigIntEquals(
      player1.ethWagered,
      player1EthWagered.minus(caveEntryFee)
    );
    const player2 = getPlayer('0x0000000000000000000000000000000000000456');
    assert.bigIntEquals(
      player2.ethWagered,
      player2EthWagered.minus(caveEntryFee)
    );
  });
  test('Should set the loser of the round when status is 4', () => {
    mockGetRoundCall('3', '1');
    // 10 ** 16 => 1ETH = 100 USDT
    mockPriceOracleCalls(BigInt.fromI32(10).pow(16));

    const roundRevealedEvent = createRoundStatusUpdatedEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      4
    );
    handleRoundStatusUpdated(roundRevealedEvent);

    const round = Round.load('3-1')!;
    assert.stringEquals(round.status, RoundStatus.REVEALED);
    assert.assertNotNull(round.loser);
    const cave = getCave(round.cave);

    const playerRounds = round.players.load();
    assert.i32Equals(playerRounds.length, 2);

    const player1 = getPlayer('0x0000000000000000000000000000000000000123');
    assert.stringEquals(round.loser!, player1.id);
    assert.bigIntEquals(player1.roundsLostCount, BigInt.fromI32(1));
    assert.bigIntEquals(player1.roundsWonCount, BigInt.zero());
    assert.bigIntEquals(player1.ethWon, BigInt.zero());
    assert.bigIntEquals(player1.ethLost, cave.enterAmount);
    assert.bigIntEquals(
      player1.usdLost,
      cave.enterAmount.times(BigInt.fromI32(100))
    );
    assert.bigIntEquals(player1.looksWon, BigInt.zero());
    assert.bigIntEquals(player1.looksLost, BigInt.zero());
    const player2 = getPlayer('0x0000000000000000000000000000000000000456');
    assert.bigIntEquals(player2.roundsLostCount, BigInt.zero());
    assert.bigIntEquals(player2.roundsWonCount, BigInt.fromI32(1));
    assert.bigIntEquals(player2.looksWon, BigInt.zero());
    assert.bigIntEquals(player2.looksLost, BigInt.zero());
    assert.bigIntEquals(player2.ethLost, BigInt.zero());
    assert.bigIntEquals(player2.ethWon, cave.prizeAmount);
    assert.bigIntEquals(
      player2.usdWon,
      cave.prizeAmount.times(BigInt.fromI32(100))
    );
  });
  test('Should set the loser of the round when status is 4 and cave is in looks', () => {
    mockGetRoundCall('4', '1');
    // 10 ** 16 => 1ETH = 100 USDT / 1ETH = 100 LOOKS
    // 10 ** 16 => 1LOOKS = 1USDT
    mockPriceOracleCalls(BigInt.fromI32(10).pow(14));

    const roundRevealedEvent = createRoundStatusUpdatedEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(1),
      4
    );
    handleRoundStatusUpdated(roundRevealedEvent);

    const round = Round.load('4-1')!;
    assert.stringEquals(round.status, RoundStatus.REVEALED);
    assert.assertNotNull(round.loser);
    const cave = getCave(round.cave);

    const playerRounds = round.players.load();
    assert.i32Equals(playerRounds.length, 2);

    const player1 = getPlayer('0x0000000000000000000000000000000000000123');
    assert.stringEquals(round.loser!, player1.id);
    assert.bigIntEquals(player1.roundsLostCount, BigInt.fromI32(1));
    assert.bigIntEquals(player1.roundsWonCount, BigInt.zero());
    assert.bigIntEquals(player1.ethWon, BigInt.zero());
    assert.bigIntEquals(player1.ethLost, BigInt.zero());
    assert.bigIntEquals(cave.enterAmount, player1.usdLost);
    assert.bigIntEquals(player1.looksWon, BigInt.zero());
    assert.bigIntEquals(player1.looksLost, cave.enterAmount);
    const player2 = getPlayer('0x0000000000000000000000000000000000000456');
    assert.bigIntEquals(player2.roundsLostCount, BigInt.zero());
    assert.bigIntEquals(player2.roundsWonCount, BigInt.fromI32(1));
    assert.bigIntEquals(player2.looksWon, cave.prizeAmount);
    assert.bigIntEquals(player2.looksLost, BigInt.zero());
    assert.bigIntEquals(player2.ethLost, BigInt.zero());
    assert.bigIntEquals(player2.ethWon, BigInt.zero());
    assert.bigIntEquals(cave.prizeAmount, player2.usdWon);
  });
});
