import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterEach
} from 'matchstick-as/assembly/index';
import { BigInt, Address } from '@graphprotocol/graph-ts';
import { handleCaveAdded, handleCaveRemoved } from '../src/poke-the-bear';
import {
  createCaveAddedEvent,
  createCaveRemovedEvent
} from './poke-the-bear-utils';

afterEach(() => {
  clearStore();
});

describe('handleCaveAdded', () => {
  beforeAll(() => {
    let caveId = BigInt.fromI32(1);
    let enterAmount = BigInt.fromI32(10000000);
    let enterCurrency = Address.fromString(
      '0x0000000000000000000000000000000000000001'
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

    assert.fieldEquals('Cave', '1', 'id', '1');
    assert.fieldEquals('Cave', '1', 'enterAmount', '10000000');
    assert.fieldEquals(
      'Cave',
      '1',
      'enterCurrency',
      '0x0000000000000000000000000000000000000001'
    );
    assert.fieldEquals('Cave', '1', 'roundDuration', '600');
    assert.fieldEquals('Cave', '1', 'playersPerRound', '10');
    assert.fieldEquals('Cave', '1', 'protocolFeeBp', '50');
    assert.fieldEquals('Cave', '1', 'isActive', 'true');
  });
});

describe('handleCaveRemoved', () => {
  beforeAll(() => {
    let newCaveAddedEvent = createCaveAddedEvent(
      BigInt.fromI32(1),
      BigInt.fromI32(10000000),
      Address.fromString('0x0000000000000000000000000000000000000001'),
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
