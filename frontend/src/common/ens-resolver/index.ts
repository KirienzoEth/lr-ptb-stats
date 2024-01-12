import { createPublicClient, http } from 'viem';
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
