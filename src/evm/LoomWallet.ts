// @ts-ignore
import { ETHEREUM_CHAIN_ID, LOOM_CHAIN_ID, LOOM_READ_URL, LOOM_WRITE_URL } from "react-native-dotenv";

import { mnemonicToSeed } from "bip39";
import EventEmitter from "events";
import HDKey from "hdkey";
import { Client, CryptoUtils, LocalAddress, LoomProvider, NonceTxMiddleware, SignedTxMiddleware } from "loom-js";
import Web3 from "web3";
import Address from "./Address";
import Contract from "./Contract";
import ERC20Token from "./ERC20Token";
import Wallet from "./Wallet";

class LoomWallet implements Wallet {
    public web3: Web3;
    public mnemonic: string;
    public address: Address;
    public client: Client;
    public ERC20Registry: Contract;
    public ERC20Proxy: Contract;
    private eventEmitter: EventEmitter;

    constructor(mnemonic: string) {
        this.mnemonic = mnemonic;
        this.address = new Address(
            LOOM_CHAIN_ID,
            LocalAddress.fromPublicKey(CryptoUtils.publicKeyFromPrivateKey(this.privateKeyFromMnemonic(mnemonic)))
        );
        this.client = new Client(LOOM_CHAIN_ID, LOOM_WRITE_URL, LOOM_READ_URL);
        this.eventEmitter = new EventEmitter();
        this.web3 = this.createWeb3(mnemonic);
        this.ERC20Registry = new Contract(this.web3, {
            abi: require("@dnextco/alice-proxies/abis/ERC20Registry.json"),
            networks: require("@dnextco/alice-proxies/networks/ERC20Registry.json")
        });
        this.ERC20Proxy = new Contract(this.web3, {
            abi: require("@dnextco/alice-proxies/abis/ERC20Proxy.json"),
            networks: require("@dnextco/alice-proxies/networks/ERC20Proxy.json")
        });
    }

    public createWeb3 = (mnemonic: string) => {
        const setupMiddlewareFn = (client: Client, pk: Uint8Array) => {
            const publicKey = CryptoUtils.publicKeyFromPrivateKey(pk);
            return [new NonceTxMiddleware(publicKey, client), new SignedTxMiddleware(pk)];
        };
        const provider = new LoomProvider(this.client, this.privateKeyFromMnemonic(mnemonic), setupMiddlewareFn);
        provider.on("connect", () => {
            this.eventEmitter.emit("connected");
        });
        provider.on("end", () => {
            this.eventEmitter.emit("disconnected");
            this.web3 = this.createWeb3(mnemonic);
        });

        // @ts-ignore
        const web3 = new Web3(provider);
        web3.eth.defaultAccount = this.address.local.toChecksumString();
        return web3;
    };

    public addEventListener = (event: "connected" | "disconnected", listener: (...args: any[]) => void) =>
        this.eventEmitter.addListener(event, listener);

    public removeEventListener = (event: "connected" | "disconnected", listener: (...args: any[]) => void) =>
        this.eventEmitter.removeListener(event, listener);

    public fetchERC20Tokens = async () => {
        const registry = await this.ERC20Registry.deployed();
        return (await registry.getRegisteredERC20Tokens()).map(
            token =>
                new ERC20Token(
                    token.name,
                    token.symbol,
                    token.decimals,
                    Address.fromString(LOOM_CHAIN_ID + ":" + token.localAddress),
                    Address.fromString(ETHEREUM_CHAIN_ID + ":" + token.foreignAddress)
                )
        );
    };

    private privateKeyFromMnemonic = (mnemonic: string) => {
        const seed = mnemonicToSeed(mnemonic);
        const hdkey = HDKey.fromMasterSeed(seed).derive("m/44'/148'/0'");
        return CryptoUtils.generatePrivateKeyFromSeed(hdkey.privateKey);
    };
}

export default LoomWallet;
