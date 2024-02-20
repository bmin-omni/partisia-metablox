import * as fs from 'fs';

import {
  AbiParser,
  FileAbi,
  FnRpcBuilder,
  ScValueStruct,
  StateReader,
  StateBytes,
  BlockchainAddress,
  // VecTypeSpec,
} from "@partisiablockchain/abi-client";

// var filePath: string = 'contract/xiaoyi_did.abi';
var filePath: string = 'contract/veric_did.abi';
const fileAbi: FileAbi = new AbiParser(fs.readFileSync(filePath)).parseAbi();

export interface ContractState {
  owner: BlockchainAddress,
  owner_did: String,
  // nonce: VecTypeSpec, // Key: Address, Value: Nonce
  // dids: VecTypeSpec, // Key: DID, Value: Controller Address
  // attributes: VecTypeSpec, // Key: DID, Value: Attributes list
  // delegates: VecTypeSpec, // Key: DID, Value: Delegates list <Key: Delegate Address, Value: Expire At>
}

export function newContractState(
  owner: BlockchainAddress,
  owner_did: String,
  // nonce: VecTypeSpec,
  // dids: VecTypeSpec,
  // attributes: VecTypeSpec,
  // delegates: VecTypeSpec,
): ContractState {
  return { owner, owner_did, 
    // nonce, dids, attributes, delegates 
  };
}

function fromScValueMetaBloxState(structValue: ScValueStruct): ContractState {
  return {
    owner: BlockchainAddress.fromBuffer(structValue.getFieldValue("owner")!.addressValue().value),
    owner_did: structValue.getFieldValue("owner_did")!.stringValue(),
    // nonce: structValue.getFieldValue("nonce")!.vecValue(),

  };
}

export function deserializeMetaBloxState(state: StateBytes): ContractState {
  const scValue = new StateReader(state.state, fileAbi.contract, state.avlTrees).readState();
  return fromScValueMetaBloxState(scValue);
}

export interface SecretVarId {
  rawId: number;
}

export function newSecretVarId(rawId: number): SecretVarId {
  return { rawId };
}

export function initialize(description: string): Buffer {
  const fnBuilder = new FnRpcBuilder("initialize", fileAbi.contract);
  fnBuilder.addString(description);
  return fnBuilder.getBytes();
}

export function register_did(sender: string): Buffer {
  const fnBuilder = new FnRpcBuilder("register_did", fileAbi.contract);
  // console.log(fnBuilder);
  // fnBuilder.addString("did:veric:0x" + sender);
  fnBuilder.addString(sender);
  return fnBuilder.getBytes();
}
