const algosdk = require("algosdk");

/**
 * Wait until the transaction is confirmed or rejected, or until 'timeout'
 * number of rounds have passed.
 * @param {algosdk.Algodv2} algodClient the Algod V2 client
 * @param {string} txId the transaction ID to wait for
 * @param {number} timeout maximum number of rounds to wait
 * @return {Promise<*>} pending transaction information
 * @throws Throws an error if the transaction is not confirmed or rejected in the next timeout rounds
 */
const waitForConfirmation = async function (algodClient, txId, timeout) {
  if (algodClient == null || txId == null || timeout < 0) {
    throw new Error("Bad arguments");
  }

  const status = (await algodClient.status().do());
  if (status === undefined) {
    throw new Error("Unable to get node status");
  }

  const startround = status["last-round"] + 1;
  let currentround = startround;

  while (currentround < (startround + timeout)) {
    const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
    if (pendingInfo !== undefined) {
      if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
        //Got the completed Transaction
        return pendingInfo;
      } else {
        if (pendingInfo["pool-error"] != null && pendingInfo["pool-error"].length > 0) {
          // If there was a pool error, then the transaction has been rejected!
          throw new Error("Transaction " + txId + " rejected - pool error: " + pendingInfo["pool-error"]);
        }
      }
    }
    await algodClient.statusAfterBlock(currentround).do();
    currentround++;
  }

  throw new Error("Transaction " + txId + " not confirmed after " + timeout + " rounds!");
};

 (async () => {
  const startTime = new Date();

  const mnemonic = "bacon million amateur liberty pudding almost festival weapon popular fiction switch focus track unable initial coil nominee exhaust cloud check hint knock aware about learn";
  const account = algosdk.mnemonicToSecretKey(mnemonic);

  const algodClient = new algosdk.Algodv2("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "http://localhost", 4001);
  const params = await algodClient.getTransactionParams().do();

  const tx1 = algosdk.makePaymentTxnWithSuggestedParams(
    account.addr, account.addr, 1, undefined, undefined, params);
  const tx2 = algosdk.makePaymentTxnWithSuggestedParams(
    account.addr, account.addr, 2, undefined, undefined, params);
  const tx3 = algosdk.makePaymentTxnWithSuggestedParams(
    account.addr, account.addr, 3, undefined, undefined, params);

  const txs = [tx1, tx2, tx3];
  algosdk.assignGroupID(txs);

  const stx1 = tx1.signTxn(account.sk);
  const stx2 = tx2.signTxn(account.sk);
  const stx3 = tx3.signTxn(account.sk);

  const stxs = [stx1, stx2, stx3];

  const tx = (await algodClient.sendRawTransaction(stxs).do());
  console.log("Transaction: " + tx.txId);

  // Wait for transaction to be confirmed
  await waitForConfirmation(algodClient, tx.txId, 100);

  const endTime = new Date();
  console.log("Time elapsed: " + (endTime-startTime) + "ms")
})();