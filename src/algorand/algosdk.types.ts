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

export interface Tx {
  name: 'Transaction';
  tag: Buffer;
  from: {
    publicKey: Uint8Array;
    checksum: Uint8Array
  };
  to?: string;
  fee?: number;
  amount?: number;
  firstRound: number;
  lastRound: number;
  note: Uint8Array;
  genesisID: string;
  genesisHash: Buffer;
  lease: Uint8Array;
  closeRemainderTo: any;
  voteKey: any;
  selectionKey: any;
  voteFirst: any;
  voteLast: any;
  voteKeyDilution: any;
  assetIndex: any;
  assetTotal: number;
  assetDecimals: number;
  assetDefaultFrozen: number;
  assetManager: {
    publicKey: Uint8Array;
    checksum: Uint8Array;
  };
  assetReserve: {
    publicKey: Uint8Array;
    checksum: Uint8Array;
  };
  assetFreeze: {
    publicKey: Uint8Array;
    checksum: Uint8Array;
  };
  assetClawback: {
    publicKey: Uint8Array;
    checksum: Uint8Array;
  };
  assetUnitName: string;
  assetName: string;
  assetURL: string;
  assetMetadataHash: string;
  freezeAccount: string;
  freezeState: boolean;
  assetRevocationTarget: string;
  appIndex: string;
  appOnComplete: any;
  appLocalInts: number;
  appLocalByteSlices: number;
  appGlobalInts: number;
  appGlobalByteSlices: number;
  appApprovalProgram: Program;
  appClearProgram: Program;
  appArgs: Uint8Array;
  appAccounts: any;
  appForeignApps: any;
  appForeignAssets: any;
  type: string;
  reKeyTo: any;
  group: any
}

export interface SignedTx {
  txID: string,
  blob: Uint8Array
}

export interface TxPendingInformation {
  signedTx: SignedTx,
  applicationId: string,
  asaId: string
}

type Program = any;