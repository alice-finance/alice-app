import { ETHEREUM_CHAIN_ID, LOOM_CHAIN_ID, LOOM_READ_URL, LOOM_WRITE_URL } from "react-native-dotenv";

import { mnemonicToSeed } from "bip39";
import BN from "bn.js";
import EventEmitter from "events";
import HDKey from "hdkey";
import { Client, CryptoUtils, LocalAddress, LoomProvider, NonceTxMiddleware, SignedTxMiddleware } from "loom-js";
import Web3 from "web3";
import { toBN } from "../utils/bn-utils";
import Address from "./Address";
import ContractFactory from "./ContractFactory";
import ERC20Token from "./ERC20Token";
import Wallet from "./Wallet";

class LoomWallet implements Wallet {
    public web3: Web3;
    public mnemonic: string;
    public address: Address;
    public client: Client;
    public ERC20: ContractFactory;
    public ERC20Registry: ContractFactory;
    public ERC20Proxy: ContractFactory;
    public MoneyMarket: ContractFactory;
    public SavingsInterestCalculator: ContractFactory;
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
        this.ERC20 = new ContractFactory(this.web3, {
            abi: require("loom-js/dist/mainnet-contracts/ERC20.json")
        });
        this.ERC20Registry = new ContractFactory(this.web3, {
            abi: require("@dnextco/alice-proxies/abis/ERC20Registry.json"),
            networks: require("@dnextco/alice-proxies/networks/ERC20Registry.json")
        });
        this.ERC20Proxy = new ContractFactory(this.web3, {
            abi: require("@dnextco/alice-proxies/abis/ERC20Proxy.json"),
            networks: require("@dnextco/alice-proxies/networks/ERC20Proxy.json")
        });
        this.MoneyMarket = new ContractFactory(this.web3, {
            abi: require("@alice-finance/money-market/abis/MoneyMarket.json"),
            networks: require("@alice-finance/money-market/networks/MoneyMarket.json")
        });
        this.SavingsInterestCalculator = new ContractFactory(this.web3, {
            abi: require("@alice-finance/money-market/abis/SavingsInterestCalculatorV1.json")
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

    public getBalance = async () => {
        const balance = await this.web3.eth.getBalance(this.address.toLocalAddressString());
        return toBN(balance);
    };

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

    public fetchERC20Balances = async (
        tokens: ERC20Token[],
        updateBalance: (address: Address, balance: BN) => void
    ) => {
        const ethToken = tokens.find(token => token.loomAddress.isNull());
        if (ethToken) {
            // TODO
        }
        const addresses = tokens.filter(token => !token.loomAddress.isNull()).map(token => token.loomAddress);
        const erc20Proxy = await this.ERC20Proxy.deployed();
        const balances = await erc20Proxy.getERC20Balances(addresses.map(address => address.toLocalAddressString()));
        addresses.forEach((address, index) => updateBalance(address, toBN(balances[index])));
    };

    public fetchSavingsMultiplier = async () => {
        const market = await this.MoneyMarket.deployed();
        return toBN(await market.MULTIPLIER());
    };

    public fetchSavingsAssetAddress = async () => {
        const market = await this.MoneyMarket.deployed();
        return Address.fromString(LOOM_CHAIN_ID + ":" + (await market.asset()));
    };

    private privateKeyFromMnemonic = (mnemonic: string) => {
        const seed = mnemonicToSeed(mnemonic);
        const hdkey = HDKey.fromMasterSeed(seed).derive("m/44'/148'/0'");
        return CryptoUtils.generatePrivateKeyFromSeed(hdkey.privateKey);
    };
}

export default LoomWallet;
