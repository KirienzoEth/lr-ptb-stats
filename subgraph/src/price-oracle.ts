import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { PriceOracle } from '../generated/PriceOracle/PriceOracle';

export const priceOracleAddress = Address.fromString(
  '0x00000000000A95dBfC66D37F3FC5E597C0b03Daf'
);
export const looksTokenAddress = Address.fromString(
  '0xf4d2888d29d722226fafa5d9b24f9164c092421e'
);
export const usdtTokenAddress = Address.fromString(
  '0xdac17f958d2ee523a2206206994597c13d831ec7'
);

/**
 * Convert the amount of LOOKS to an amount of USDT tokens
 * Note: The conversion insure a precision to the 4th decimal point, if you need more, increase the multiplier value
 * @param amountInWei Amount of LOOKS tokens (in wei) to convert
 * @returns How much is the amount provided worth in USDT tokens
 */
export function convertLooksToUSDT(amountInWei: BigInt): BigInt {
  let contract = PriceOracle.bind(priceOracleAddress);
  const looksPriceInETH = contract.getTWAP(
    looksTokenAddress,
    BigInt.fromI32(1)
  );
  const usdtPriceInETH = contract.getTWAP(usdtTokenAddress, BigInt.fromI32(1));
  const precisionMultiplier = BigInt.fromI32(100_000_000);
  const looksToUSDT = looksPriceInETH
    .times(precisionMultiplier)
    .div(usdtPriceInETH);
  return amountInWei.times(looksToUSDT).div(precisionMultiplier);
}

/**
 * Convert the amount of ETH to an amount of USDT tokens
 * Note: The conversion insure a precision to the 4th decimal point, if you need more, increase the multiplier value
 * @param amountInWei Amount of ether (in wei) to convert
 * @returns How much is the amount provided worth in USDT tokens
 */
export function convertEthToUSDT(amountInWei: BigInt): BigInt {
  const priceOracleAddress = Address.fromString(
    '0x00000000000A95dBfC66D37F3FC5E597C0b03Daf'
  );
  let contract = PriceOracle.bind(priceOracleAddress);
  const usdtPriceInETH = contract.getTWAP(usdtTokenAddress, BigInt.fromI32(1));
  const precisionMultiplier = BigInt.fromI32(10_000);
  const ethToUSDT = precisionMultiplier
    .times(BigInt.fromI32(10).pow(18))
    .div(usdtPriceInETH);
  return amountInWei.times(ethToUSDT).div(precisionMultiplier);
}
