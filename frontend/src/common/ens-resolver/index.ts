import { createPublicClient, http } from 'viem';
import { normalize } from 'viem/ens';
import { mainnet } from 'viem/chains';

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function getEnsNameFromAddress(
  address: `0x${string}`
): Promise<string | null> {
  return await publicClient.getEnsName({
    address: address,
  });
}

export async function getAddressFromEnsName(
  name: string
): Promise<string | null> {
  return await publicClient.getEnsAddress({
    name: normalize(name),
  });
}
