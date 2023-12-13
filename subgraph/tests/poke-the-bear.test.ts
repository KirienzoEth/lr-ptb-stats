import {
  assert,
  describe,
  test,
  clearStore,
  beforeEach,
  afterEach,
  newMockEvent
} from 'matchstick-as/assembly/index';
import { BigInt, Address, log, ethereum, Bytes } from '@graphprotocol/graph-ts';
import {
  handleCaveAdded,
  handleCaveRemoved,
  handlePrizesClaimed,
  handleRoundStatusUpdated,
  handleRoundsEntered
} from '../src/poke-the-bear';
import {
  createCaveAddedEvent,
  createCaveRemovedEvent,
  createPrizesClaimedEvent,
  createRoundStatusUpdatedEvent,
  createRoundsEnteredEvent,
  mockEthPriceInUSDT,
  mockGetRoundCall,
  mockLooksPriceInETH
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
    // 10 ** 15 => 1ETH = 1000 USDT
    mockEthPriceInUSDT(BigInt.fromI32(10).pow(15));
    // 2 * (10 ** 16) => 1LOOKS = 0.02ETH = 20USDT
    mockLooksPriceInETH(BigInt.fromI32(2).times(BigInt.fromI32(10).pow(16)));
  });
  test('Should create a new round, player and playerRound', () => {
    let newRoundsEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      BigInt.fromI32(1),
      Address.fromString('0x0000000000000000000000000000000000000123')
    );
    newRoundsEnteredEvent.receipt!.gasUsed = BigInt.fromI32(150_000);
    newRoundsEnteredEvent.transaction.gasPrice = BigInt.fromI32(100);
    handleRoundsEntered(newRoundsEnteredEvent);

    assert.entityCount('Round', 1);
    let round = Round.load('3-1')!;
    assert.stringEquals(round.cave, '3');
    assert.bigIntEquals(round.roundId, BigInt.fromI32(1));
    assert.stringEquals(round.status, RoundStatus.OPEN);
    assert.bigIntEquals(round.playersCount, BigInt.fromI32(1));

    assert.entityCount('Player', 1);
    let player = Player.load('0x0000000000000000000000000000000000000123')!;
    assert.bigIntEquals(player.usdWagered, BigInt.fromI32(200000000));
    assert.bigIntEquals(player.looksWagered, BigInt.fromI32(10000000));
    assert.bigIntEquals(player.ethWagered, BigInt.zero());
    assert.bigIntEquals(player.ethWon, BigInt.zero());
    assert.bigIntEquals(player.looksWon, BigInt.zero());
    assert.bigIntEquals(player.ethLost, BigInt.zero());
    assert.bigIntEquals(player.ethWon, BigInt.zero());
    assert.bigIntEquals(player.roundsEnteredCount, BigInt.fromI32(1));
    assert.bigIntEquals(player.feesPaidInETH, BigInt.fromI32(15_000_000));
    assert.bigIntEquals(player.feesPaidInUSD, BigInt.fromI64(15_000_000_000));

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
    assert.bigIntEquals(playerRound.usdWagered, BigInt.fromString('200000000'));
    assert.bigIntEquals(playerRound.feesPaidInETH, BigInt.fromI32(15_000_000));
    assert.bigIntEquals(
      playerRound.feesPaidInUSD,
      BigInt.fromI64(15_000_000_000)
    );
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
    assert.bigIntEquals(player.usdWagered, BigInt.fromString('50000000000'));
    assert.bigIntEquals(player.ethWagered, BigInt.fromI32(50000000));

    let playerRound = PlayerRound.load(
      '0x0000000000000000000000000000000000000321-4-1'
    )!;
    assert.bigIntEquals(
      playerRound.usdWagered,
      BigInt.fromString('50000000000')
    );
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
    const caveEntryFee = getCave('4').enterAmount;
    let player = Player.load('0x0000000000000000000000000000000000000321')!;
    assert.bigIntEquals(
      player.ethWagered,
      caveEntryFee.times(BigInt.fromI32(3))
    );
    assert.bigIntEquals(
      player.usdWagered,
      caveEntryFee.times(BigInt.fromI32(3 * 1000))
    );
    assert.bigIntEquals(player.roundsEnteredCount, BigInt.fromI32(3));

    assert.entityCount('PlayerRound', 3);
    let playerRound = PlayerRound.load(
      '0x0000000000000000000000000000000000000321-4-1'
    );
    assert.assertNotNull(playerRound);
    assert.bigIntEquals(
      playerRound!.usdWagered,
      BigInt.fromString('50000000000')
    );

    playerRound = PlayerRound.load(
      '0x0000000000000000000000000000000000000321-4-2'
    );
    assert.assertNotNull(playerRound);
    assert.bigIntEquals(
      playerRound!.usdWagered,
      BigInt.fromString('50000000000')
    );

    playerRound = PlayerRound.load(
      '0x0000000000000000000000000000000000000321-4-3'
    );
    assert.assertNotNull(playerRound);
    assert.bigIntEquals(
      playerRound!.usdWagered,
      BigInt.fromString('50000000000')
    );
  });
  test('Should accumulate rounds data if player enter multiple rounds one after another', () => {
    const playerAddress = '0x0000000000000000000000000000000000000321';
    const gasUsed = BigInt.fromI32(150_000);
    const gasPrice = BigInt.fromI32(100);
    const feesPaidInETH = gasUsed.times(gasPrice);
    const feesPaidInUSD = feesPaidInETH.times(BigInt.fromI32(1000));
    let newRoundsEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(1),
      BigInt.fromI32(1),
      Address.fromString(playerAddress)
    );
    newRoundsEnteredEvent.receipt!.gasUsed = gasUsed;
    newRoundsEnteredEvent.transaction.gasPrice = gasPrice;
    handleRoundsEntered(newRoundsEnteredEvent);
    newRoundsEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(2),
      BigInt.fromI32(1),
      Address.fromString(playerAddress)
    );
    newRoundsEnteredEvent.receipt!.gasUsed = gasUsed;
    newRoundsEnteredEvent.transaction.gasPrice = gasPrice;
    handleRoundsEntered(newRoundsEnteredEvent);
    newRoundsEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      Address.fromString(playerAddress)
    );
    newRoundsEnteredEvent.receipt!.gasUsed = gasUsed;
    newRoundsEnteredEvent.transaction.gasPrice = gasPrice;
    handleRoundsEntered(newRoundsEnteredEvent);

    assert.entityCount('Round', 3);
    assert.entityCount('Player', 1);
    const caveEntryFee = getCave('4').enterAmount;
    let player = Player.load(playerAddress)!;
    assert.bigIntEquals(
      player.ethWagered,
      caveEntryFee.times(BigInt.fromI32(3))
    );
    assert.bigIntEquals(
      player.usdWagered,
      caveEntryFee.times(BigInt.fromI32(3 * 1000))
    );
    assert.bigIntEquals(
      player.feesPaidInETH,
      feesPaidInETH.times(BigInt.fromI32(3))
    );
    assert.bigIntEquals(
      player.feesPaidInUSD,
      feesPaidInUSD.times(BigInt.fromI32(3))
    );
    assert.bigIntEquals(player.roundsEnteredCount, BigInt.fromI32(3));

    assert.entityCount('PlayerRound', 3);
    let playerRound = PlayerRound.load(`${playerAddress}-4-1`)!;
    assert.assertNotNull(playerRound);
    assert.bigIntEquals(
      playerRound.usdWagered,
      BigInt.fromString('50000000000')
    );
    assert.bigIntEquals(playerRound.feesPaidInETH, feesPaidInETH);
    assert.bigIntEquals(playerRound.feesPaidInUSD, feesPaidInUSD);

    playerRound = PlayerRound.load(`${playerAddress}-4-2`)!;
    assert.assertNotNull(playerRound);
    assert.bigIntEquals(
      playerRound.usdWagered,
      BigInt.fromString('50000000000')
    );
    assert.bigIntEquals(playerRound.feesPaidInETH, feesPaidInETH);
    assert.bigIntEquals(playerRound.feesPaidInUSD, feesPaidInUSD);

    playerRound = PlayerRound.load(`${playerAddress}-4-3`)!;
    assert.assertNotNull(playerRound);
    assert.bigIntEquals(
      playerRound.usdWagered,
      BigInt.fromString('50000000000')
    );
    assert.bigIntEquals(playerRound.feesPaidInETH, feesPaidInETH);
    assert.bigIntEquals(playerRound.feesPaidInUSD, feesPaidInUSD);
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
    // 10 ** 15 => 1ETH = 1000 USDT
    mockEthPriceInUSDT(BigInt.fromI32(10).pow(15));
    // 2 * (10 ** 16) => 1LOOKS = 0.02ETH = 20USDT
    mockLooksPriceInETH(BigInt.fromI32(2).times(BigInt.fromI32(10).pow(16)));

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
    const player1Address = '0x0000000000000000000000000000000000000123';
    const player2Address = '0x0000000000000000000000000000000000000456';
    let roundEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      BigInt.fromI32(1),
      Address.fromString(player1Address)
    );
    handleRoundsEntered(roundEnteredEvent);

    roundEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      BigInt.fromI32(2),
      Address.fromString(player2Address)
    );
    handleRoundsEntered(roundEnteredEvent);

    let player1 = getPlayer(player1Address);
    let player2 = getPlayer(player2Address);
    const player1EthWagered = player1.ethWagered;
    const player1UsdWagered = player1.usdWagered;
    const player2EthWagered = player2.ethWagered;
    const player2UsdWagered = player2.usdWagered;
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
    player1 = getPlayer(player1Address);
    assert.bigIntEquals(
      player1.ethWagered,
      player1EthWagered.minus(caveEntryFee)
    );
    assert.bigIntEquals(
      player1.usdWagered,
      player1UsdWagered.minus(playerRounds[0].usdWagered)
    );
    player2 = getPlayer(player2Address);
    assert.bigIntEquals(
      player2.ethWagered,
      player2EthWagered.minus(caveEntryFee)
    );
    assert.bigIntEquals(
      player2.usdWagered,
      player2UsdWagered.minus(playerRounds[1].usdWagered)
    );
  });
  test('Should set the loser of the round when status is 4', () => {
    mockGetRoundCall('3', '1');
    const player1Address = '0x0000000000000000000000000000000000000123';
    const player2Address = '0x0000000000000000000000000000000000000456';
    let roundEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      BigInt.fromI32(1),
      Address.fromString(player1Address)
    );
    roundEnteredEvent.receipt!.gasUsed = BigInt.fromI32(150_000);
    roundEnteredEvent.transaction.gasPrice = BigInt.fromI32(100);
    handleRoundsEntered(roundEnteredEvent);

    roundEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      BigInt.fromI32(2),
      Address.fromString(player2Address)
    );
    handleRoundsEntered(roundEnteredEvent);

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

    const player1 = getPlayer(player1Address);
    assert.stringEquals(round.loser!, player1.id);
    assert.bigIntEquals(player1.roundsLostCount, BigInt.fromI32(1));
    assert.bigIntEquals(player1.roundsWonCount, BigInt.zero());
    assert.bigIntEquals(player1.ethWon, BigInt.zero());
    assert.bigIntEquals(player1.ethLost, cave.enterAmount);
    assert.bigIntEquals(player1.usdLost, playerRounds[0].usdWagered);
    assert.bigIntEquals(player1.looksWon, BigInt.zero());
    assert.bigIntEquals(player1.looksLost, BigInt.zero());
    const player2 = getPlayer(player2Address);
    assert.bigIntEquals(player2.roundsLostCount, BigInt.zero());
    assert.bigIntEquals(player2.roundsWonCount, BigInt.fromI32(1));
    assert.bigIntEquals(player2.looksWon, BigInt.zero());
    assert.bigIntEquals(player2.looksLost, BigInt.zero());
    assert.bigIntEquals(player2.ethLost, BigInt.zero());
    assert.bigIntEquals(player2.ethWon, cave.prizeAmount);
    assert.bigIntEquals(
      player2.usdWon,
      cave.prizeAmount.times(BigInt.fromI32(1000))
    );
  });
  test('Should set the loser of the round when status is 4 and cave is in looks', () => {
    mockGetRoundCall('4', '1');
    const player1Address = '0x0000000000000000000000000000000000000123';
    const player2Address = '0x0000000000000000000000000000000000000456';
    let roundEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(1),
      BigInt.fromI32(1),
      Address.fromString(player1Address)
    );
    handleRoundsEntered(roundEnteredEvent);

    roundEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(1),
      BigInt.fromI32(2),
      Address.fromString(player2Address)
    );
    handleRoundsEntered(roundEnteredEvent);

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

    const player1 = getPlayer(player1Address);
    assert.stringEquals(round.loser!, player1.id);
    assert.bigIntEquals(player1.roundsLostCount, BigInt.fromI32(1));
    assert.bigIntEquals(player1.roundsWonCount, BigInt.zero());
    assert.bigIntEquals(player1.ethWon, BigInt.zero());
    assert.bigIntEquals(player1.ethLost, BigInt.zero());
    assert.bigIntEquals(player1.looksWon, BigInt.zero());
    assert.bigIntEquals(player1.looksLost, cave.enterAmount);
    assert.bigIntEquals(player1.usdLost, playerRounds[0].usdWagered);
    assert.bigIntEquals(player1.usdWon, BigInt.zero());
    assert.bigIntEquals(player1.usdPnL, player1.usdLost.neg());
    const player2 = getPlayer(player2Address);
    assert.bigIntEquals(player2.roundsLostCount, BigInt.zero());
    assert.bigIntEquals(player2.roundsWonCount, BigInt.fromI32(1));
    assert.bigIntEquals(player2.looksWon, cave.prizeAmount);
    assert.bigIntEquals(player2.looksLost, BigInt.zero());
    assert.bigIntEquals(player2.ethLost, BigInt.zero());
    assert.bigIntEquals(player2.ethWon, BigInt.zero());
    assert.bigIntEquals(player2.usdLost, BigInt.zero());
    const usdToWin = cave.prizeAmount.times(BigInt.fromI32(20));
    assert.bigIntEquals(usdToWin, player2.usdWon);
    assert.bigIntEquals(usdToWin, player2.usdPnL);
  });
  test('Should accumulate the losses/earning through multiple rounds', () => {
    mockGetRoundCall('4', '1');
    mockGetRoundCall('4', '2');
    const player1Address = '0x0000000000000000000000000000000000000123';
    const player2Address = '0x0000000000000000000000000000000000000456';
    let roundEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(1),
      BigInt.fromI32(2),
      Address.fromString(player1Address)
    );
    handleRoundsEntered(roundEnteredEvent);

    roundEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(1),
      BigInt.fromI32(2),
      Address.fromString(player2Address)
    );
    handleRoundsEntered(roundEnteredEvent);

    let roundRevealedEvent = createRoundStatusUpdatedEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(1),
      4
    );
    handleRoundStatusUpdated(roundRevealedEvent);
    roundRevealedEvent = createRoundStatusUpdatedEvent(
      BigInt.fromI32(4),
      BigInt.fromI32(2),
      4
    );
    handleRoundStatusUpdated(roundRevealedEvent);

    const cave = getCave('4');
    const player1 = getPlayer(player1Address);
    const usdWagered = getRound('4', '1').players.load()[0].usdWagered;
    assert.bigIntEquals(player1.roundsLostCount, BigInt.fromI32(2));
    assert.bigIntEquals(
      player1.looksLost,
      cave.enterAmount.times(BigInt.fromI32(2))
    );
    assert.bigIntEquals(
      player1.usdLost,
      usdWagered.times(BigInt.fromI32(2)),
      'USD lost should equal the sum of the wagered amount in lost rounds'
    );
    assert.bigIntEquals(
      player1.usdPnL,
      usdWagered.times(BigInt.fromI32(2)).neg(),
      'Player PnL should be equal to the negative amount of USD wagered across all rounds'
    );
    const player2 = getPlayer(player2Address);
    assert.bigIntEquals(player2.roundsWonCount, BigInt.fromI32(2));
    assert.bigIntEquals(
      cave.prizeAmount.times(BigInt.fromI32(2)),
      player2.looksWon
    );
    assert.bigIntEquals(
      cave.prizeAmount.times(BigInt.fromI32(40)),
      player2.usdWon,
      'USD lost should equal the sum of the wagered amount in lost rounds'
    );
    assert.bigIntEquals(
      cave.prizeAmount.times(BigInt.fromI32(40)),
      player2.usdPnL,
      'Player PnL should be equal to the amount of USD won across all rounds'
    );
  });
});

describe('handlePrizesClaimed', () => {
  beforeEach(() => {
    mockGetRoundCall('3', '1');
    // 10 ** 15 => 1ETH = 1000 USDT
    mockEthPriceInUSDT(BigInt.fromI32(10).pow(15));
    // 2 * (10 ** 16) => 1LOOKS = 0.02ETH = 20USDT
    mockLooksPriceInETH(BigInt.fromI32(2).times(BigInt.fromI32(10).pow(16)));

    // ETH cave
    const ethCave = createCave('3');
    ethCave.enterAmount = BigInt.fromI32(10_000_000);
    ethCave.prizeAmount = BigInt.fromI32(9_500_000);
    ethCave.playersPerRound = 2;
    ethCave.protocolFeeBp = 50;
    ethCave.save();

    let roundsOpenedEvent = createRoundStatusUpdatedEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      // 1 == Round opened
      1
    );
    handleRoundStatusUpdated(roundsOpenedEvent);
    const player1Address = '0x0000000000000000000000000000000000000123';
    const player2Address = '0x0000000000000000000000000000000000000456';
    let roundEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      BigInt.fromI32(1),
      Address.fromString(player1Address)
    );
    roundEnteredEvent.receipt!.gasUsed = BigInt.fromI32(150_000);
    roundEnteredEvent.transaction.gasPrice = BigInt.fromI32(100);
    handleRoundsEntered(roundEnteredEvent);

    roundEnteredEvent = createRoundsEnteredEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(2),
      BigInt.fromI32(1),
      Address.fromString(player2Address)
    );
    roundEnteredEvent.receipt!.gasUsed = BigInt.fromI32(150_000);
    roundEnteredEvent.transaction.gasPrice = BigInt.fromI32(100);
    handleRoundsEntered(roundEnteredEvent);

    const roundRevealedEvent = createRoundStatusUpdatedEvent(
      BigInt.fromI32(3),
      BigInt.fromI32(1),
      4
    );
    handleRoundStatusUpdated(roundRevealedEvent);
  });
  test('Should add the fees paid by the player when claiming', () => {
    const player = getPlayer('0x0000000000000000000000000000000000000123');
    const feesPaidInETH = player.feesPaidInETH;
    const feesPaidInUSD = player.feesPaidInUSD;

    const prizesClaimedEvent = createPrizesClaimedEvent(
      [],
      Address.fromString(player.id)
    );
    prizesClaimedEvent.receipt!.gasUsed = BigInt.fromI32(10_000);
    prizesClaimedEvent.transaction.gasPrice = BigInt.fromI32(10);
    handlePrizesClaimed(prizesClaimedEvent);

    const playerAfterClaim = getPlayer(
      '0x0000000000000000000000000000000000000123'
    );
    assert.bigIntEquals(
      feesPaidInETH,
      playerAfterClaim.feesPaidInETH.minus(BigInt.fromI32(100_000))
    );
    assert.bigIntEquals(
      feesPaidInUSD,
      playerAfterClaim.feesPaidInUSD.minus(BigInt.fromI32(100_000_000))
    );
  });
});
