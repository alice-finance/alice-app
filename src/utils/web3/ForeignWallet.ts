// @ts-ignore
import { ETHEREUM_PROVIDER_URL } from "react-native-dotenv";

import { mnemonicToSeed } from "bip39";
import EthereumWallet from "ethereumjs-wallet";
import EthereumHDKey from "ethereumjs-wallet/hdkey";
import EventEmitter from "events";
import Web3 from "web3";
import Wallet from "./Wallet";

class ForeignWallet implements Wallet {
    public web3: Web3;
    public mnemonic: string;
    public privateKey?: string;
    public address?: string;
    private eventEmitter: EventEmitter;
    private ethereumWallet: EthereumWallet;

    constructor(mnemonic: string) {
        this.web3 = this.createWeb3(mnemonic);
        this.mnemonic = mnemonic;
        this.eventEmitter = new EventEmitter();
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

        this.ethereumWallet = this.ethereumWalletFromMnemonic(mnemonic);
        this.privateKey = this.ethereumWallet.getPrivateKeyString();
        this.address = this.ethereumWallet.getChecksumAddressString();

        const web3 = new Web3(provider);
        web3.eth.accounts.wallet.clear();
        if (this.privateKey) {
            web3.eth.accounts.wallet.add(this.privateKey);
        }
        if (this.address) {
            web3.eth.defaultAccount = this.address;
        }
        return web3;
    };

    public addEventListener = (event: "connected" | "disconnected", listener: (...args: any[]) => void) =>
        this.eventEmitter.addListener(event, listener);

    public removeEventListener = (event: "connected" | "disconnected", listener: (...args: any[]) => void) =>
        this.eventEmitter.removeListener(event, listener);

    private ethereumWalletFromMnemonic = (mnemonic: string) => {
        const seed = mnemonicToSeed(mnemonic);
        return EthereumHDKey.fromMasterSeed(seed)
            .derivePath("m/44'/60'/0'/0/0")
            .getWallet();
    };
}

export default ForeignWallet;
