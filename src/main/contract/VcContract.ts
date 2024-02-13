import * as fs from 'fs';
import BN from "bn.js";
// import * as crypto from "crypto";

import {
  AbiParser,
  FileAbi,
  FnRpcBuilder,
  ScValueStruct,
  StateReader,
  StateBytes,
  BlockchainAddress,
  // VecTypeSpec,
  // TypeIndex,
  // TypeSpec
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

// interface SubjectInfo {
//   property_name: String,
//   property_value: String,
// }

// function newSubjectInfo(typeIndex: TypeIndex.Vec, valueType: TypeSpec): VecTypeSpec {
//   return { typeIndex, valueType };
// }

export function upload_vc(sender: string, description: string): Buffer {
  const fnBuilder = new FnRpcBuilder("upload_vc", fileAbi.contract);
  const vcId = new BN(Math.floor(Math.random() * 9999999999999));

  fnBuilder.addString("did:veric:0x" + sender);

  fnBuilder.addU128(vcId);

  fnBuilder.addString("did:veric:0x" + sender);

  fnBuilder.addVec();
  // routeStatus.addString("Router status");
  // const statusString = "Router Status";
  // const statusHash = crypto.createHash('sha256').update(statusString).digest('hex');

  // var subjectInfo = newSubjectInfo( statusString, statusHash)

  // routeStatus.addString(statusString);
  // routeStatus.addString(statusHash);

  // console.log(fnBuilder);

  var date = new Date();
  var yearAfter = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  fnBuilder.addString(date.toISOString());
  fnBuilder.addString(yearAfter.toISOString());
  fnBuilder.addString(description);
  fnBuilder.addBool(false);
  
  return fnBuilder.getBytes();
}
