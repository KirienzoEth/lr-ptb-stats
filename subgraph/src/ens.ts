import { Address, dataSource } from '@graphprotocol/graph-ts';
import { ENSReverseLookup } from '../generated/PokeTheBear/ENSReverseLookup';
import { Player } from '../generated/schema';

export const ensReverseRecordsAddress = Address.fromString(
  '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C'
);

export function updatePlayerENSName(player: Player): void {
  if (dataSource.network() != 'mainnet') {
    return;
  }

  const ensName = ENSReverseLookup.bind(ensReverseRecordsAddress);
  const name = ensName.getNames([Address.fromString(player.id)])[0];

  if (name != '' && name != player.ensName) {
    player.ensName = name;
  } else if (name == '' && player.ensName != null) {
    player.ensName = null;
  }
}
