import { Network } from '@/common/enums';
import { useParams } from 'next/navigation';
import { formatEther } from 'viem';

export function formatTokenAmount(amount: bigint, fractionDigits = 2) {
  return (+formatEther(amount)).toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function getNetwork(): Network {
  const queryValue = useParams().network as Network;
  if (typeof queryValue === 'string') {
    return queryValue as Network;
  }

  return Network.ETHEREUM;
}
