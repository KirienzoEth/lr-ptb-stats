import { formatEther } from 'viem';

export function formatTokenAmount(amount: bigint, fractionDigits = 2) {
  return (+formatEther(amount)).toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}
