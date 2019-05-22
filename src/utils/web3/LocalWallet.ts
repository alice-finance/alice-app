// @ts-ignore
import { LOOM_CHAIN_ID, LOOM_READ_URL, LOOM_WRITE_URL } from "react-native-dotenv";

import { mnemonicToSeedSync } from "bip39";
import EventEmitter from "events";
import HDKey from "hdkey";
import { Client, CryptoUtils, LocalAddress, LoomProvider, NonceTxMiddleware, SignedTxMiddleware } from "loom-js";
import Web3 from "web3";
import Wallet from "./Wallet";

class LocalWallet implements Wallet {
    public web3: Web3;
    public mnemonic: string;
    public address?: string;
    private eventEmitter: EventEmitter;

    constructor(mnemonic: string) {
        this.web3 = this.createWeb3(mnemonic);
        this.mnemonic = mnemonic;
        this.eventEmitter = new EventEmitter();
    }

    public createWeb3 = (mnemonic: string) => {
        const privateKey = this.privateKeyFromMnemonic(mnemonic);
        const setupMiddlewareFn = (client: Client, pk: Uint8Array) => {
            const publicKey = CryptoUtils.publicKeyFromPrivateKey(pk);
            return [new NonceTxMiddleware(publicKey, client), new SignedTxMiddleware(pk)];
        };
        const provider = new LoomProvider(
            new Client(LOOM_CHAIN_ID, LOOM_WRITE_URL, LOOM_READ_URL),
            privateKey,
            setupMiddlewareFn
        );
        provider.on("connect", () => {
            this.eventEmitter.emit("connected");
        });
        provider.on("end", () => {
            this.eventEmitter.emit("disconnected");
            this.web3 = this.createWeb3(mnemonic);
        });

        const web3 = new Web3(provider);
        this.address = LocalAddress.fromPublicKey(CryptoUtils.publicKeyFromPrivateKey(privateKey)).toChecksumString();
        web3.eth.defaultAccount = this.address;
        return web3;
    };

    public addEventListener = (event: "connected" | "disconnected", listener: (...args: any[]) => void) =>
        this.eventEmitter.addListener(event, listener);

    public removeEventListener = (event: "connected" | "disconnected", listener: (...args: any[]) => void) =>
        this.eventEmitter.removeListener(event, listener);

    private privateKeyFromMnemonic = (mnemonic: string) => {
        const seed = mnemonicToSeedSync(mnemonic);
        const hdkey = HDKey.fromMasterSeed(seed).derive("m/44'/148'/0'");
        return CryptoUtils.generatePrivateKeyFromSeed(hdkey.privateKey);
    };
}

export default LocalWallet;
