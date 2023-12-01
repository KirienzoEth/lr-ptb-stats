import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { CaveAdded } from "../generated/schema"
import { CaveAdded as CaveAddedEvent } from "../generated/PokeTheBear/PokeTheBear"
import { handleCaveAdded } from "../src/poke-the-bear"
import { createCaveAddedEvent } from "./poke-the-bear-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let caveId = BigInt.fromI32(234)
    let enterAmount = BigInt.fromI32(234)
    let enterCurrency = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let roundDuration = BigInt.fromI32(234)
    let playersPerRound = 123
    let protocolFeeBp = 123
    let newCaveAddedEvent = createCaveAddedEvent(
      caveId,
      enterAmount,
      enterCurrency,
      roundDuration,
      playersPerRound,
      protocolFeeBp
    )
    handleCaveAdded(newCaveAddedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CaveAdded created and stored", () => {
    assert.entityCount("CaveAdded", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CaveAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "caveId",
      "234"
    )
    assert.fieldEquals(
      "CaveAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "enterAmount",
      "234"
    )
    assert.fieldEquals(
      "CaveAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "enterCurrency",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "CaveAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "roundDuration",
      "234"
    )
    assert.fieldEquals(
      "CaveAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "playersPerRound",
      "123"
    )
    assert.fieldEquals(
      "CaveAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "protocolFeeBp",
      "123"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
