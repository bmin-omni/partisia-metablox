import * as fs from 'fs';
import BN from "bn.js";

import {
  AbiParser,
  FileAbi,
  FnRpcBuilder,
  ScValueStruct,
  StateReader,
  StateBytes,
  BlockchainAddress,
  AbstractBuilder,
  // VecTypeSpec,
  // TypeIndex,
  // TypeSpec
} from "@partisiablockchain/abi-client";

// var filePath: string = 'contract/xiaoyi_vc.abi';
var filePath: string = 'contract/veric_vc.abi';
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

// export function upload_vc(
//   issuer: string,
//   vcId: BN,
//   subject: string,
//   statusString: string,
//   statusHash: string,
//   validSince: string,
//   validUntil: string,
//   description: string,
//   isRevoked: boolean): Buffer {
//   const fnBuilder = new FnRpcBuilder("upload_vc", fileAbi.contract);

//   fnBuilder.addString(issuer);
//   fnBuilder.addU128(vcId);
//   fnBuilder.addString(subject);
//   console.log(statusHash);
//   console.log(statusString);
//   fnBuilder.addVec();

//   fnBuilder.addString(validSince);
//   fnBuilder.addString(validUntil);
//   fnBuilder.addString(description);
//   fnBuilder.addBool(isRevoked);
  
//   return fnBuilder.getBytes();
// }

function buildRpcSubjectInfo(value: SubjectInfo, builder: AbstractBuilder) {
  const structBuilder = builder.addStruct();
  structBuilder.addString(value.propertyName);
  structBuilder.addString(value.propertyValue);
}

export interface SubjectInfo {
  propertyName: string;
  propertyValue: string;
}

export function newSubjectInfo(propertyName: string, propertyValue: string): SubjectInfo {
  return {propertyName, propertyValue};
}

export function upload_vc(issuerDid: string, vcId: BN, subjectDid: string, subjectInfo: SubjectInfo[], validSince: string, validUntil: string, descrption: string, isRevoked: boolean): Buffer {
  const fnBuilder = new FnRpcBuilder("upload_vc", fileAbi.contract);
  fnBuilder.addString(issuerDid);
  fnBuilder.addU128(vcId);
  fnBuilder.addString(subjectDid);
  const vecBuilder8 = fnBuilder.addVec();
  for (const vecEntry9 of subjectInfo) {
    buildRpcSubjectInfo(vecEntry9, vecBuilder8);
  }
  fnBuilder.addString(validSince);
  fnBuilder.addString(validUntil);
  fnBuilder.addString(descrption);
  fnBuilder.addBool(isRevoked);
  return fnBuilder.getBytes();
}