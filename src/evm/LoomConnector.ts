import { LOOM_CHAIN_ID, LOOM_NETWORK_NAME, LOOM_READ_URL, LOOM_WRITE_URL } from "react-native-dotenv";

import { ethers } from "ethers";
import { mnemonicToSeed } from "ethers/utils/hdnode";
import HDKey from "hdkey";
import { Client, CryptoUtils, LocalAddress, LoomProvider } from "loom-js/dist";
import { EthCoin } from "loom-js/dist/contracts";
import { createDefaultTxMiddleware } from "loom-js/dist/helpers";
import { toBigNumber } from "../utils/big-number-utils";
import Address from "./Address";
import Connector from "./Connector";
import ERC20Token from "./ERC20Token";

class LoomConnector implements Connector {
    public address: Address;
    public client: Client;
    public signer: ethers.Signer;

    constructor(mnemonic: string) {
        const privateKey = this.privateKeyFromMnemonic(mnemonic);
        this.address = Address.newLoomAddress(
            LocalAddress.fromPublicKey(CryptoUtils.publicKeyFromPrivateKey(privateKey)).toChecksumString()
        );
        this.client = new Client(LOOM_NETWORK_NAME, LOOM_WRITE_URL, LOOM_READ_URL);
        this.client.txMiddleware = createDefaultTxMiddleware(this.client, privateKey);
        const provider = new ethers.providers.Web3Provider(
            new LoomProvider(this.client, privateKey, () => this.client.txMiddleware)
        );
        this.signer = provider.getSigner(0);
    }

    public getERC20 = (address: string) => {
        const abi = require("loom-js/dist/mainnet-contracts/ERC20.json");
        return new ethers.Contract(address, abi, this.signer);
    };

    public getERC20Registry = () => {
        const networks = require("@dnextco/alice-proxies/networks/ERC20Registry.json");
        const abi = require("@dnextco/alice-proxies/abis/ERC20Registry.json");
        return new ethers.Contract(networks[LOOM_CHAIN_ID].address, abi, this.signer);
    };

    public getERC20Proxy = () => {
        const networks = require("@dnextco/alice-proxies/networks/ERC20Proxy.json");
        const abi = require("@dnextco/alice-proxies/abis/ERC20Proxy.json");
        return new ethers.Contract(networks[LOOM_CHAIN_ID].address, abi, this.signer);
    };

    public getMoneyMarket = () => {
        const networks = require("@alice-finance/money-market/networks/MoneyMarket.json");
        const abi = require("@alice-finance/money-market/abis/MoneyMarket.json");
        return new ethers.Contract(networks[LOOM_CHAIN_ID].address, abi, this.signer);
    };

    public fetchERC20Tokens = async () => {
        const tokens = await this.getERC20Registry().getRegisteredERC20Tokens();
        return tokens.map(
            token =>
                new ERC20Token(
                    token.name,
                    token.symbol,
                    token.decimals,
                    Address.newLoomAddress(token.localAddress),
                    Address.newEthereumAddress(token.foreignAddress)
                )
        );
    };

    public fetchERC20Balances = async (
        tokens: ERC20Token[],
        updateBalance: (address: Address, balance: ethers.utils.BigNumber) => void
    ) => {
        const ethToken = tokens.find(token => token.loomAddress.isNull());
        if (ethToken) {
            const eth = await EthCoin.createAsync(this.client, this.address);
            const balance = await eth.getBalanceOfAsync(this.address);
            updateBalance(ethToken.loomAddress, toBigNumber(balance.toString()));
        }
        const addresses = tokens.filter(token => !token.loomAddress.isNull()).map(token => token.loomAddress);
        const erc20Proxy = this.getERC20Proxy();
        const balances = await erc20Proxy.getERC20Balances(addresses.map(address => address.toLocalAddressString()));
        addresses.forEach((address, index) => updateBalance(address, toBigNumber(balances[index])));
    };

    public fetchSavingsMultiplier = async () => {
        const market = this.getMoneyMarket();
        return toBigNumber(await market.MULTIPLIER());
    };

    public fetchSavingsAssetAddress = async () => {
        const market = this.getMoneyMarket();
        return Address.fromString(LOOM_NETWORK_NAME + ":" + (await market.asset()));
    };

    private privateKeyFromMnemonic = (mnemonic: string) => {
        const seed = mnemonicToSeed(mnemonic);
        const hdkey = HDKey.fromMasterSeed(seed).derive("m/44'/148'/0'");
        return CryptoUtils.generatePrivateKeyFromSeed(hdkey.privateKey);
    };
}

export default LoomConnector;