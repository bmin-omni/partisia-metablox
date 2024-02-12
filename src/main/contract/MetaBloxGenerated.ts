import * as fs from 'fs';

import {
  AbiParser,
  FileAbi,
  FnRpcBuilder,
  // ScValueStruct,
  // StateReader,
  // StateBytes,
  BlockchainAddress,
  VecTypeSpec,
} from "@partisiablockchain/abi-client";

var filePath: string = '../xiaoyi_did.abi';
const fileAbi: FileAbi = new AbiParser(fs.readFileSync(filePath)).parseAbi();

export interface ContractState {
  owner: BlockchainAddress,
  owner_did: String,
  nonce: VecTypeSpec, // Key: Address, Value: Nonce
  dids: VecTypeSpec, // Key: DID, Value: Controller Address
  attributes: VecTypeSpec, // Key: DID, Value: Attributes list
  delegates: VecTypeSpec, // Key: DID, Value: Delegates list <Key: Delegate Address, Value: Expire At>
}

export function newContractState(
  owner: BlockchainAddress,
  owner_did: String,
  nonce: VecTypeSpec,
  dids: VecTypeSpec,
  attributes: VecTypeSpec,
  delegates: VecTypeSpec,
): ContractState {
  return { owner, owner_did, nonce, dids, attributes, delegates };
}

// function fromScValuePetitionState(structValue: ScValueStruct): ContractState {
//   return {
//     signedBy: structValue
//       .getFieldValue("signed_by")!
//       .setValue()
//       .values.map((sc1) => BlockchainAddress.fromBuffer(sc1.addressValue().value)),
//     description: structValue.getFieldValue("description")!.stringValue(),
//   };
// }

// export function deserializePetitionState(state: StateBytes): PetitionState {
//   const scValue = new StateReader(state.state, fileAbi.contract, state.avlTrees).readState();
//   return fromScValuePetitionState(scValue);
// }

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

export function register_did(): Buffer {
  const fnBuilder = new FnRpcBuilder("register_did", fileAbi.contract);
  console.log(fnBuilder);
  return fnBuilder.getBytes();
}
