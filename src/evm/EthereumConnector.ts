import { ETHEREUM_ERC20_GATEWAY, ETHEREUM_RPC_URL } from "react-native-dotenv";

import { ethers } from "ethers";
import { toBigNumber } from "../utils/big-number-utils";
import Address from "./Address";
import Connector from "./Connector";
import ERC20Token from "./ERC20Token";

class EthereumConnector implements Connector {
    public wallet!: ethers.Wallet;
    public provider!: ethers.providers.BaseProvider;
    public address!: Address;

    constructor(privateKey: string) {
        this.init(privateKey);
    }

    public getERC20 = (address: string) => {
        const abi = require("loom-js/dist/mainnet-contracts/ERC20.json");
        // @ts-ignore
        return new ethers.Contract(address, abi, this.wallet);
    };

    public getGateway = () => {
        const abi = require("loom-js/dist/mainnet-contracts/Gateway.json");
        return new ethers.Contract(ETHEREUM_ERC20_GATEWAY, abi, this.wallet);
    };

    public fetchERC20Balances = async (
        tokens: ERC20Token[],
        updateBalance: (address: Address, balance: ethers.utils.BigNumber) => void
    ) => {
        const ethToken = tokens.find(token => token.ethereumAddress.isNull());
        if (ethToken) {
            updateBalance(ethToken.ethereumAddress, toBigNumber(await this.wallet.getBalance()));
        }
        await Promise.all(
            tokens
                .filter(token => !token.loomAddress.isNull())
                .map(async token => {
                    const erc20 = this.getERC20(token.ethereumAddress.toLocalAddressString());
                    const balance = await erc20.balanceOf(this.address.toLocalAddressString());
                    updateBalance(token.ethereumAddress, balance);
                })
        );
    };

    private init(privateKey: string) {
        this.provider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC_URL);
        this.provider.on("end", () => this.init(privateKey));
        this.provider.on("error", () => {});
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.address = Address.newEthereumAddress(this.wallet.address);
    }
}

export default EthereumConnector;
