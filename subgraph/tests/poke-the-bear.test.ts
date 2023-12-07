import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach,
  createMockedFunction
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
  createRoundsEnteredEvent
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
    const cave = createCave('3');
    cave.enterAmount = BigInt.fromI32(10_000_000);
    cave.playersPerRound = 2;
    cave.protocolFeeBp = 50;
    cave.save();

    let roundsOpenedEvent = createRoundStatusUpdatedEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      // 1 == Round opened
      1
    );
    handleRoundStatusUpdated(roundsOpenedEvent);
    const player1 = createPlayer('0x0000000000000000000000000000000000000123');
    player1.ethWagered = BigInt.fromI32(10_000_000);
    player1.roundsEnteredCount = BigInt.fromI32(1);
    const player2 = createPlayer('0x0000000000000000000000000000000000000456');
    player2.ethWagered = BigInt.fromI32(20_000_000);
    player2.roundsEnteredCount = BigInt.fromI32(2);

    player1.save();
    player2.save();

    createPlayerRound(player1.id, cave.id, '1');
    createPlayerRound(player2.id, cave.id, '1');
  });
  test('Should create a new round when status is 1', () => {
    assert.entityCount('Round', 1);
    let round = Round.load('3-1')!;
    assert.stringEquals(round.cave, '3');
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

    assert.entityCount('Round', 1);
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
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(3)),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))
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
    const roundRevealedEvent = createRoundStatusUpdatedEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      4
    );
    handleRoundStatusUpdated(roundRevealedEvent);

    assert.entityCount('Round', 1);
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
    assert.bigIntEquals(player1.looksWon, BigInt.zero());
    assert.bigIntEquals(player1.looksLost, BigInt.zero());
    const player2 = getPlayer('0x0000000000000000000000000000000000000456');
    assert.bigIntEquals(player2.roundsLostCount, BigInt.zero());
    assert.bigIntEquals(player2.roundsWonCount, BigInt.fromI32(1));
    assert.bigIntEquals(player2.looksWon, BigInt.zero());
    assert.bigIntEquals(player2.looksLost, BigInt.zero());
    assert.bigIntEquals(player2.ethLost, BigInt.zero());
    assert.bigIntEquals(
      player2.ethWon,
      cave.enterAmount
        .times(BigInt.fromI32(10_000 - cave.protocolFeeBp))
        .div(BigInt.fromI32(10_000))
        .div(BigInt.fromI32(cave.playersPerRound - 1))
    );
  });
});
