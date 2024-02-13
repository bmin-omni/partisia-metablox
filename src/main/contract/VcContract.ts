import * as fs from 'fs';

import {
  AbiParser,
  FileAbi,
  FnRpcBuilder,
  ScValueStruct,
  StateReader,
  StateBytes,
  BlockchainAddress,
  VecTypeSpec,
} from "@partisiablockchain/abi-client";

var filePath: string = 'contract/xiaoyi_vc.abi';
const fileAbi: FileAbi = new AbiParser(fs.readFileSync(filePath)).parseAbi();

export interface ContractState {
  owner: BlockchainAddress,
  registry_address: String
}

export function newContractState(
  owner: BlockchainAddress,
  registry_address: String
): ContractState {
  return { owner, registry_address  };
}

function fromScValueVcState(structValue: ScValueStruct): ContractState {
  return {
    owner: BlockchainAddress.fromBuffer(structValue.getFieldValue("owner")!.addressValue().value),
    registry_address: structValue.getFieldValue("registry_address")!.stringValue(),
    // nonce: structValue.getFieldValue("nonce")!.vecValue(),

  };
}

export function deserializeVcState(state: StateBytes): ContractState {
  const scValue = new StateReader(state.state, fileAbi.contract, state.avlTrees).readState();
  return fromScValueVcState(scValue);
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

export function upload_vc(sender: string, vcId: string, subjectInfo: VecTypeSpec, date: Date, description: string ): Buffer {
  const fnBuilder = new FnRpcBuilder("upload_vc", fileAbi.contract);
  // console.log(fnBuilder);
  fnBuilder.addString("did:veric:0x" + sender);
  fnBuilder.addString(vcId);
  fnBuilder.addVec();
  return fnBuilder.getBytes();
}
