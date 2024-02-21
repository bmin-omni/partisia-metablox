import BN from "bn.js";

import { TransactionApi } from "../client/TransactionApi";
import { register_did } from "./DidContract";
import { upload_vc } from "./VcContract";
import { getContractAddress } from "../AppState";
import { SubjectInfo } from "./VcContract";

/**
 * API for the token contract.
 * This minimal implementation only allows for transferring tokens to a single address.
 *
 * The implementation uses the TransactionApi to send transactions, and ABI for the contract to be
 * able to build the RPC for the transfer transaction.
 */
export class MetaBloxApi {
  private readonly transactionApi: TransactionApi;

  constructor(transactionApi: TransactionApi) {
    this.transactionApi = transactionApi;
  }

  readonly register_did = (sender: string) => {
    const address = getContractAddress();
    console.log("ADDRESS TO");
    console.log(address);
    if (address === undefined) {
      throw new Error("No address provided");
    }
    // First build the RPC buffer that is the payload of the transaction.
    const rpc = register_did(sender);
    // Then send the payload via the transaction API.
    return this.transactionApi.sendTransactionAndWait(address, rpc, 1_000);
  };

  readonly upload_vc = (
    issuer: string,
    vcId: BN,
    subject: string,
    subjectInfo: SubjectInfo[],
    validSince: string,
    validUntil: string,
    description: string,
    isRevoked: boolean) => {
    const address = getContractAddress();
    console.log("ADDRESS TO");
    console.log(address);
    if (address === undefined) {
      throw new Error("No address provided");
    }
    // First build the RPC buffer that is the payload of the transaction.
    const rpc = upload_vc(issuer, vcId, subject, subjectInfo, validSince, validUntil, description, isRevoked);
    // Then send the payload via the transaction API.
    return this.transactionApi.sendTransactionAndWait(address, rpc, 1_000);
  };
}
