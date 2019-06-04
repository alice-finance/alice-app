import {
    ETHEREUM_CHAIN_ID,
    ETHEREUM_ERC20_GATEWAY,
    ETHEREUM_NETWORK_NAME,
    ETHEREUM_PROVIDER_URL
} from "react-native-dotenv";

import { mnemonicToSeed } from "bip39";
import BN from "bn.js";
import ethutil from "ethereumjs-util";
import EthWallet from "ethereumjs-wallet";
import EthHDKey from "ethereumjs-wallet/hdkey";
import EventEmitter from "events";
import { LocalAddress } from "loom-js";
import { IEthereumSigner } from "loom-js/dist";
import Web3 from "web3";
import { toBN } from "../utils/erc20-utils";
import Address from "./Address";
import ContractFactory from "./ContractFactory";
import ERC20Token from "./ERC20Token";
import Wallet from "./Wallet";

class EthereumWallet implements Wallet, IEthereumSigner {
    public web3: Web3;
    public mnemonic: string;
    public address: Address;
    public ERC20: ContractFactory;
    public ERC20Gateway: ContractFactory;
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
        this.ERC20 = new ContractFactory(this.web3, {
            abi: require("loom-js/dist/mainnet-contracts/ERC20.json")
        });
        this.ERC20Gateway = new ContractFactory(this.web3, {
            abi: require("loom-js/dist/mainnet-contracts/ERC20Gateway.json"),
            networks: {
                [ETHEREUM_NETWORK_NAME]: {
                    address: ETHEREUM_ERC20_GATEWAY
                }
            }
        });
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

    public getBalance = async () => {
        const balance = await this.web3.eth.getBalance(this.address.toLocalAddressString());
        return toBN(balance);
    };

    public fetchERC20Balances = async (
        tokens: ERC20Token[],
        updateBalance: (address: Address, balance: BN) => void
    ) => {
        const ethToken = tokens.find(token => token.ethereumAddress.isNull());
        if (ethToken) {
            updateBalance(ethToken.ethereumAddress, await this.getBalance());
        }
        await Promise.all(
            tokens
                .filter(token => !token.loomAddress.isNull())
                .map(async token => {
                    const erc20 = await this.ERC20.at(token.ethereumAddress.toLocalAddressString());
                    const balance = await erc20.balanceOf(this.address.toLocalAddressString());
                    updateBalance(token.ethereumAddress, balance);
                })
        );
    };

    public async signAsync(msg: string): Promise<Uint8Array> {
        const privateKey = this.ethereumWallet.getPrivateKeyString();
        const ret = await this.web3.eth.accounts.sign(msg, privateKey);
        // @ts-ignore
        const sig = ret.signature.slice(2);

        const mode = 1; // Geth
        const r = ethutil.toBuffer("0x" + sig.substring(0, 64)) as Buffer;
        const s = ethutil.toBuffer("0x" + sig.substring(64, 128)) as Buffer;
        const v = parseInt(sig.substring(128, 130), 16);

        return Buffer.concat([ethutil.toBuffer(mode) as Buffer, r, s, ethutil.toBuffer(v) as Buffer]);
    }

    private ethereumWalletFromMnemonic = (mnemonic: string) => {
        const seed = mnemonicToSeed(mnemonic);
        return EthHDKey.fromMasterSeed(seed)
            .derivePath("m/44'/60'/0'/0/0")
            .getWallet();
    };
}

export default EthereumWallet;
