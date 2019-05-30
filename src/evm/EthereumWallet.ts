// @ts-ignore
import { ETHEREUM_CHAIN_ID, ETHEREUM_PROVIDER_URL } from "react-native-dotenv";

import { mnemonicToSeed } from "bip39";
import EthWallet from "ethereumjs-wallet";
import EthHDKey from "ethereumjs-wallet/hdkey";
import EventEmitter from "events";
import { LocalAddress } from "loom-js";
import Web3 from "web3";
import Address from "./Address";
import Wallet from "./Wallet";

class EthereumWallet implements Wallet {
    public web3: Web3;
    public mnemonic: string;
    public address: Address;
    private eventEmitter: EventEmitter;
    private ethereumWallet: EthWallet;

    constructor(mnemonic: string) {
        this.mnemonic = mnemonic;
        this.ethereumWallet = this.ethereumWalletFromMnemonic(mnemonic);
        this.address = new Address(
            ETHEREUM_CHAIN_ID,
            LocalAddress.fromHexString(this.ethereumWallet.getChecksumAddressString())
        );
        this.eventEmitter = new EventEmitter();
        this.web3 = this.createWeb3(mnemonic);
    }

    public createWeb3 = (mnemonic: string) => {
        const provider = new Web3.providers.WebsocketProvider(ETHEREUM_PROVIDER_URL);
        provider.on("connected", () => {
            this.eventEmitter.emit("connected");
        });
        provider.on("end", () => {
            this.eventEmitter.emit("disconnected");
            this.web3 = this.createWeb3(mnemonic);
        });

        const web3 = new Web3(provider);
        web3.eth.accounts.wallet.clear();
        const privateKey = this.ethereumWallet.getPrivateKeyString();
        if (privateKey) {
            web3.eth.accounts.wallet.add(privateKey);
        }
        web3.eth.defaultAccount = this.address.local.toChecksumString();
        return web3;
    };

    public addEventListener = (event: "connected" | "disconnected", listener: (...args: any[]) => void) =>
        this.eventEmitter.addListener(event, listener);

    public removeEventListener = (event: "connected" | "disconnected", listener: (...args: any[]) => void) =>
        this.eventEmitter.removeListener(event, listener);

    private ethereumWalletFromMnemonic = (mnemonic: string) => {
        const seed = mnemonicToSeed(mnemonic);
        return EthHDKey.fromMasterSeed(seed)
            .derivePath("m/44'/60'/0'/0/0")
            .getWallet();
    };
}

export default EthereumWallet;
