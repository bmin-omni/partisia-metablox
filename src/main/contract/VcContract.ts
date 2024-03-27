/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as fs from 'fs';
import BN from "bn.js";
import {
  AbiParser,
  AbstractBuilder,
  FileAbi, FnRpcBuilder,
  BlockchainAddress
} from "@partisiablockchain/abi-client";

var filePath: string = 'contract/pbc_vc_storage.abi';
const fileAbi: FileAbi = new AbiParser(fs.readFileSync(filePath)).parseAbi();

type Option<K> = K | undefined;

export interface SubjectInfo {
  propertyName: string;
  propertyValue: string;
}

export function newSubjectInfo(propertyName: string, propertyValue: string): SubjectInfo {
  return {propertyName, propertyValue};
}

function buildRpcSubjectInfo(value: SubjectInfo, builder: AbstractBuilder) {
  const structBuilder = builder.addStruct();
  structBuilder.addString(value.propertyName);
  structBuilder.addString(value.propertyValue);
}

export interface VC {
  validSince: string;
  validUntil: string;
  subjectDid: string;
  subjectInfo: SubjectInfo[];
  description: string;
  revoked: boolean;
}

export function newVC(validSince: string, validUntil: string, subjectDid: string, subjectInfo: SubjectInfo[], description: string, revoked: boolean): VC {
  return {validSince, validUntil, subjectDid, subjectInfo, description, revoked};
}

export interface ContractState {
  owner: BlockchainAddress;
  registryAddress: BlockchainAddress;
  nextVcId: BN;
  vcs: Option<Map<string, Map<BN, VC>>>;
}

export function newContractState(owner: BlockchainAddress, registryAddress: BlockchainAddress, nextVcId: BN, vcs: Option<Map<string, Map<BN, VC>>>): ContractState {
  return {owner, registryAddress, nextVcId, vcs};
}

export interface SecretVarId {
  rawId: number;
}

export function newSecretVarId(rawId: number): SecretVarId {
  return {rawId};
}

export interface EventSubscriptionId {
  rawId: number;
}

export function newEventSubscriptionId(rawId: number): EventSubscriptionId {
  return {rawId};
}

export interface ExternalEventId {
  rawId: number;
}

export function newExternalEventId(rawId: number): ExternalEventId {
  return {rawId};
}

export function initialize(): Buffer {
  const fnBuilder = new FnRpcBuilder("initialize", fileAbi.contract);
  return fnBuilder.getBytes();
}

export function configureRegistryAddress(targetAddress: BlockchainAddress): Buffer {
  const fnBuilder = new FnRpcBuilder("configure_registry_address", fileAbi.contract);
  fnBuilder.addAddress(targetAddress.asBuffer());
  return fnBuilder.getBytes();
}

export function uploadVc(issuerDid: string, subjectDid: string, subjectInfo: SubjectInfo[], validSince: string, validUntil: string, descrption: string, isRevoked: boolean): Buffer {
  const fnBuilder = new FnRpcBuilder("upload_vc", fileAbi.contract);
  fnBuilder.addString(issuerDid);
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

export function setRevoke(issuerDid: string, vcId: BN, isRevoked: boolean): Buffer {
  const fnBuilder = new FnRpcBuilder("set_revoke", fileAbi.contract);
  fnBuilder.addString(issuerDid);
  fnBuilder.addU128(vcId);
  fnBuilder.addBool(isRevoked);
  return fnBuilder.getBytes();
}

