import { ec } from "elliptic";
import { BigEndianByteOutput } from "@secata-public/bitmanipulation-ts";
import * as fs from 'fs';

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

/**
 * Structure of the raw data from a WASM contract.
 */
// interface RawContractData {
//     state: { data: string };
// }

var data = fs.readFileSync('metablox-1.pk', 'utf8');
console.log(data);

const keyPair = CryptoUtils.privateKeyToKeypair(data);
const sender = CryptoUtils.keyPairToAccountAddress(keyPair);
console.log(sender,keyPair);
handleWalletConnect(connectPrivateKey(sender, keyPair));

setContractAddress("026006f86c0733d30ed75c96460e57e573efcaa461");

setTimeout(() => 
{
  const api = getMetaBloxApi();

  console.log("BEFORE SIGNING");
  console.log(isConnected());
  console.log(api);
  if (isConnected() && api !== undefined) {
    // const browserLink = <HTMLInputElement>document.querySelector("#sign-transaction-link");
    // browserLink.innerHTML = '<br><div class="loader"></div>';
    api
      .sign()
      .then((transactionHash) => {
        // browserLink.innerHTML = `<br><a href="https://browser.testnet.partisiablockchain.com/transactions/${transactionHash}" target="_blank">Transaction link in browser</a>`;
        console.log("https://browser.testnet.partisiablockchain.com/transactions/" + transactionHash);
      })
      .catch((msg) => {
        // browserLink.innerHTML = `<br>${msg}`;
        console.log(msg);
      });
  }
},
1000);