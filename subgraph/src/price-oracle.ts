import { Address, BigInt, dataSource, log } from '@graphprotocol/graph-ts';
import { PriceOracle } from '../generated/PokeTheBear/PriceOracle';
import { UniV2Pool } from '../generated/PokeTheBear/UniV2Pool';

export const priceOracleAddress = Address.fromString(
  '0x00000000000A95dBfC66D37F3FC5E597C0b03Daf'
);
export const ethUsdtUniV2PoolAddress = Address.fromString(
  '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852'
);
export const ethUsdcUniV2PoolAddressArbitrum = Address.fromString(
  '0x905dfcd5649217c42684f23958568e533c711aa3'
);
export const looksTokenAddress = Address.fromString(
  '0xf4d2888d29d722226fafa5d9b24f9164c092421e'
);
export const usdtTokenAddress = Address.fromString(
  '0xdac17f958d2ee523a2206206994597c13d831ec7'
);

/**
 * Convert the amount of LOOKS to an amount of USDT tokens
 * @param amountInWei Amount of LOOKS tokens (in wei) to convert
 * @returns How much is the amount provided worth in USDT tokens
 */
export function convertLooksToUSDT(amountInWei: BigInt): BigInt {
  let contract = PriceOracle.bind(priceOracleAddress);
  const looksPriceInETH = contract.getTWAP(
    looksTokenAddress,
    BigInt.fromI32(1)
  );

  return convertEthToUSDT(looksPriceInETH.times(amountInWei)).div(
    BigInt.fromI32(10).pow(18)
  );
}

/**
 * Convert the amount of ETH to an amount of USDT tokens
 * Note: The conversion insure a precision to the 4th decimal point, if you need more, increase the multiplier value
 * @param amountInWei Amount of ether (in wei) to convert
 * @returns How much is the amount provided worth in USDT tokens
 */
export function convertEthToUSDT(amountInWei: BigInt): BigInt {
  if (amountInWei === BigInt.zero()) {
    return amountInWei;
  }

  const precisionMultiplier = BigInt.fromI32(10_000);
  let contract = UniV2Pool.bind(ethUsdtUniV2PoolAddress);
  if (dataSource.network() === 'arbitrum-one') {
    contract = UniV2Pool.bind(ethUsdcUniV2PoolAddressArbitrum);
  }
  const reserve = contract.getReserves();
  // token0 is WETH, token1 is USDT or USDC
  const ethReserve = reserve.get_reserve0();
  // USDT/USDC only have 6 decimals so add 12 zeroes to push to 18
  const usdtReserve = reserve.get_reserve1().times(BigInt.fromI32(10).pow(12));

  const usdtPerETH = precisionMultiplier.times(usdtReserve).div(ethReserve);

  return amountInWei.times(usdtPerETH).div(precisionMultiplier);
}
