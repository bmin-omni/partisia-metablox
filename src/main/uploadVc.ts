import { ec } from "elliptic";
import { BigEndianByteOutput } from "@secata-public/bitmanipulation-ts";
import * as fs from 'fs';
import BN from "bn.js";
import * as crypto from "crypto";

import { CryptoUtils } from "./client/CryptoUtils";
import { ConnectedWallet } from "./ConnectedWallet";
import { Rpc, TransactionPayload } from "./client/TransactionData";
import { 
  CLIENT,
  resetAccount, 
  setAccount, 
  setContractAddress, 
  getMetaBloxApi, 
  isConnected,
} from "./AppState";
import { serializeTransaction } from "./client/TransactionSerialization";
import { TransactionApi } from "./client/TransactionApi";
import { newSubjectInfo } from "./contract/VcContract";

/**
 * Function for using a private key to sign and send transactions.
 */
const connectPrivateKey = async (sender: string, keyPair: ec.KeyPair): Promise<ConnectedWallet> => {
    return {
      address: sender,
      signAndSendTransaction: (payload: TransactionPayload<Rpc>, cost = 0) => {
        // To send a transaction we need some up-to-date account information, i.e. the
        // current account nonce.
        return CLIENT.getAccountData(sender).then((accountData) => {
          if (accountData == null) {
            throw new Error("Account data was null");
          }
          // Account data was fetched, build and serialize the transaction
          // data.
          const serializedTx = serializeTransaction(
            {
              cost: String(cost),
              nonce: accountData.nonce,
              validTo: String(new Date().getTime() + TransactionApi.TRANSACTION_TTL),
            },
            payload
          );
          const hash = CryptoUtils.hashBuffers([
            serializedTx,
            BigEndianByteOutput.serialize((out) => out.writeString("Partisia Blockchain Testnet")),
          ]);
          const signature = keyPair.sign(hash);
  
          // Serialize transaction for sending
          const transactionPayload = Buffer.concat([
            CryptoUtils.signatureToBuffer(signature),
            serializedTx,
          ]);
  
          // Send the transaction to the blockchain
          return CLIENT.putTransaction(transactionPayload).then((txPointer) => {
            if (txPointer != null) {
              return {
                putSuccessful: true,
                shard: txPointer.destinationShardId,
                transactionHash: txPointer.identifier,
              };
            } else {
              return { putSuccessful: false };
            }
          });
        });
      },
    };
  };


/**
 * Common code for handling a generic wallet connection.
 * @param connect the wallet connection. Can be Mpc Wallet, Metamask, or using a private key.
 */
const handleWalletConnect = (connect: Promise<ConnectedWallet>) => {
    // Clean up state
    resetAccount();
    console.log("Connecting...");
    connect
      .then((userAccount) => {
        console.log(userAccount);
        setAccount(userAccount);
      })
      .catch((error) => {
        if ("message" in error) {
          console.log(error.message);
        } else {
          console.log("An error occurred trying to connect wallet: " + error);
        }
      });
  };

let pkList: string[] = [];
for (let pk_i = 1; pk_i <= 200; pk_i++){
  var filePath: string = '../../private_keys/metablox-' + pk_i + '.pk';
  pkList.push(fs.readFileSync(filePath, 'utf8'));
}

// console.log(pkList);

var pkIndex: number = parseInt(process.argv[2]);
var keyPair = CryptoUtils.privateKeyToKeypair(pkList[pkIndex]);
var sender = CryptoUtils.keyPairToAccountAddress(keyPair);
console.log(sender);
handleWalletConnect(connectPrivateKey(sender, keyPair));

setContractAddress("025f177db0c3433463ee67b95f1217fae7f781ce70");
setTimeout(() => 
{
  var api = getMetaBloxApi();
  const issuer = "did:veric:0x" + sender;
  const subject = "did:veric:0x" + sender;
  const vcId = new BN(Math.floor(Math.random() * 9999999999999));

  const statusString = "Router Status";
  const statusHash = crypto.createHash('sha256').update(statusString).digest('hex');
  const subjectInfo = newSubjectInfo(statusString, statusHash);
  let subjectInfoList = [subjectInfo];

  var validSince = new Date().toISOString();
  var validUntil = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

  var description = "MetaBlox router status report";
  var isRevoked = false;


  if (isConnected() && api !== undefined) {
    api
      .upload_vc(issuer, vcId, subject, subjectInfoList, validSince, validUntil, description, isRevoked)
      .then((transactionHash) => {
        console.log("https://browser.testnet.partisiablockchain.com/transactions/" + transactionHash);
      })
      .catch((msg) => {
        console.log(msg);
      });
  }
  else {
    console.log("Wallet not connected or api not created");
  }
},
1000);