import { LOOM_CHAIN_ID, LOOM_NETWORK_NAME, LOOM_READ_URL, LOOM_WRITE_URL } from "react-native-dotenv";

import { ethers } from "ethers";
import { Client, CryptoUtils, LoomProvider, NonceTxMiddleware, SignedTxMiddleware } from "loom-js/dist";
import { EthCoin } from "loom-js/dist/contracts";
import { hexToBytes } from "loom-js/dist/crypto-utils";
import { toBigNumber } from "../utils/big-number-utils";
import Address from "./Address";
import Connector from "./Connector";
import ERC20Token from "./ERC20Token";

class LoomConnector implements Connector {
    public static CLIENT = new Client(LOOM_NETWORK_NAME, LOOM_WRITE_URL, LOOM_READ_URL);

    public wallet: ethers.Wallet;
    public address: Address;

    constructor(mnemonic: string) {
        const node = ethers.utils.HDNode.fromMnemonic(mnemonic).derivePath("m/44'/148'/0'");
        const privateKey = CryptoUtils.generatePrivateKeyFromSeed(hexToBytes(node.privateKey));
        const setupMiddlewareFn = (c: Client, pk: Uint8Array) => {
            const publicKey = CryptoUtils.publicKeyFromPrivateKey(pk);
            return [new NonceTxMiddleware(publicKey, c), new SignedTxMiddleware(pk)];
        };
        const provider = new LoomProvider(LoomConnector.CLIENT, privateKey, setupMiddlewareFn);
        this.wallet = new ethers.Wallet(node, new ethers.providers.Web3Provider(provider));
        this.address = Address.newLoomAddress(this.wallet.address);
    }

    public getERC20 = (address: string) => {
        const abi = require("loom-js/dist/mainnet-contracts/ERC20.json");
        return new ethers.Contract(address, abi, this.wallet);
    };

    public getERC20Registry = () => {
        const networks = require("@dnextco/alice-proxies/networks/ERC20Registry.json");
        const abi = require("@dnextco/alice-proxies/abis/ERC20Registry.json");
        return new ethers.Contract(networks[LOOM_CHAIN_ID].address, abi, this.wallet);
    };

    public getERC20Proxy = () => {
        const networks = require("@dnextco/alice-proxies/networks/ERC20Proxy.json");
        const abi = require("@dnextco/alice-proxies/abis/ERC20Proxy.json");
        return new ethers.Contract(networks[LOOM_CHAIN_ID].address, abi, this.wallet);
    };

    public getMoneyMarket = () => {
        const networks = require("@alice-finance/money-market/networks/MoneyMarket.json");
        const abi = require("@alice-finance/money-market/abis/MoneyMarket.json");
        return new ethers.Contract(networks[LOOM_CHAIN_ID].address, abi, this.wallet);
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
            const eth = await EthCoin.createAsync(LoomConnector.CLIENT, this.address);
            const balance = await eth.getBalanceOfAsync(this.address);
            updateBalance(Address.fromString(eth.address.toString()), toBigNumber(balance));
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
}

export default LoomConnector;
