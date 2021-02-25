export interface DefaultParams {
  flatFee: boolean;
  fee: number;
  firstRound: number;
  lastRound: number;
  genesisID: string;
  genesisHash: string;
}


export interface AssetConfig {
  addr: string;  // the account issuing the transaction; the asset creator
  fee?: number;  // the number of microAlgos per byte to pay as a transaction fee
  defaultFrozen?: boolean;  // whether user accounts will need to be unfrozen before transacting
  genesisHash?: string; // hash of the genesis block of the network to be used
  totalIssuance: number;  // total number of this asset in circulation
  decimals: number;  // hint that the units of this asset are whole-integer amounts
  reserve: string;  // specified address is considered the asset reserve (it has no special privileges; this is only informational)
  freeze: string;  // specified address can freeze or unfreeze user asset holdings
  clawback: string;  // specified address can revoke user asset holdings and send them to other addresses
  manager: string;  // specified address can change reserve; freeze; clawback; and manager
  unitName: string;  // used to display asset units to user
  assetName: string;  // "friendly name" of asset
  genesisID?: string;  // like genesisHash this is used to specify network to be used
  firstRound?: number;  // first Algorand round on which this transaction is valid
  lastRound?: number;  // last Algorand round on which this transaction is valid
  note?: Uint8Array;  // arbitrary data to be stored in the transaction; here; none is stored
  assetURL?: string;  // optional string pointing to a URL relating to the asset 
  assetMetadataHash?: string;  // optional hash commitment of some sort relating to the asset. 32 character length.
}

export interface AssetInfo {
  id: string;
}

export interface SignedTx {
  txID: string,
  blob: Uint8Array
}

export interface TxPendingInformation {
  applicationId: number,
  asaId: number
}


export interface AssetsBalance {
  [asaID: number]: number|undefined;
}