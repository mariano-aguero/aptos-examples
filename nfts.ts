import dotenv from "dotenv";
dotenv.config();

import { AptosClient, AptosAccount, FaucetClient, TokenClient, Types } from "aptos";

const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";
const FAUCET_URL = process.env.APTOS_FAUCET_URL || "https://faucet.devnet.aptoslabs.com";

console.log("Node URL", NODE_URL);
console.log("Faucet URL", FAUCET_URL);

(async () => {
    const client = new AptosClient(NODE_URL);
    const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);
    const tokenClient = new TokenClient(client);

    const alice = new AptosAccount();
    const bob = new AptosAccount();

    // Fund both Alice's and Bob's Account
    await faucetClient.fundAccount(alice.address(), 10000000);
    await faucetClient.fundAccount(bob.address(), 10000000);

    const collectionName = "AliceCollection";
    const tokenName = "Alice Token";

    const txnCollectionHash = await tokenClient.createCollection(alice, collectionName, "Alice's simple collection", "https://aptos.dev");
    const txnCollection = await client.waitForTransactionWithResult(txnCollectionHash);

    const txnTokenHash = await tokenClient.createToken(
        alice,
        collectionName,
        tokenName,
        "Alice's simple token",
        1,
        "https://aptos.dev/img/nyan.jpeg",
        1000,
        alice.address(),
        0,
        0,
        ["key"],
        ["2"],
        ["int"],
    );

    const tokenId = {
        token_data_id: {
            creator: alice.address().hex(),
            collection: collectionName,
            name: tokenName,
        },
        property_version: "0",
    };

    await tokenClient.getCollectionData(alice.address().hex(), collectionName);
    let aliceBalance = await tokenClient.getTokenBalanceForAccount(alice.address().hex(), tokenId);
    const tokenData = await tokenClient.getTokenData(alice.address().hex(), collectionName, tokenName);
    await tokenClient.offerToken(alice, bob.address().hex(), alice.address().hex(), collectionName, tokenName, 1);
    aliceBalance = await tokenClient.getTokenBalanceForAccount(alice.address().hex(), tokenId);
    await tokenClient.cancelTokenOffer(alice, bob.address().hex(), alice.address().hex(), collectionName, tokenName);
    aliceBalance = await tokenClient.getTokenBalanceForAccount(alice.address().hex(), tokenId);
    await tokenClient.offerToken(alice, bob.address().hex(), alice.address().hex(), collectionName, tokenName, 1);
    aliceBalance = await tokenClient.getTokenBalanceForAccount(alice.address().hex(), tokenId);
    await tokenClient.claimToken(bob, alice.address().hex(), alice.address().hex(), collectionName, tokenName);
    const bobBalance = await tokenClient.getTokenBalanceForAccount(bob.address().hex(), tokenId);

    console.log('TokenData', tokenData);
    console.log('AliceBalance', aliceBalance);
    console.log('BobBalance', bobBalance);
})();