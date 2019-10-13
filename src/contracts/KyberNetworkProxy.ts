import { Address, ERC20Asset } from "@alice-finance/alice.js/dist";
import EthereumChain from "@alice-finance/alice.js/dist/chains/EthereumChain";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { ethers } from "ethers";

export interface KyberRate {
    expectedRate: ethers.utils.BigNumber;
    slippageRate: ethers.utils.BigNumber;
}

class KyberNetworkProxy extends ethers.Contract {
    public static ETHEREUM_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    public static MAX_ALLOWANCE = toBigNumber(2).pow(255);
    public static WALLET_ID = Address.createEthereumAddress("0x63a7b186819F6E0E1579a5C3b79526E9c6677533");

    public static at(ethereumChain: EthereumChain) {
        return new KyberNetworkProxy(
            require("./networks/KyberNetworkProxy.json")[ethereumChain.config.chainId].address,
            ethereumChain.getSigner()
        );
    }

    constructor(address: string, signerOrProvider: ethers.Signer | ethers.providers.Provider) {
        super(address, require("./abis/KyberNetworkProxy.json"), signerOrProvider);
    }

    public getExpectedRate(
        src: ERC20Asset,
        dest: ERC20Asset,
        amount: ethers.utils.BigNumber
    ): Promise<ethers.utils.BigNumber[]> {
        const address = src.ethereumAddress.isZero()
            ? KyberNetworkProxy.ETHEREUM_ADDRESS
            : src.ethereumAddress.toLocalAddressString();
        return this.functions.getExpectedRate(address, dest.ethereumAddress.toLocalAddressString(), amount);
    }

    public swapEtherToToken(
        asset: ERC20Asset,
        minConversionRate: ethers.utils.BigNumber,
        overrides?: ethers.providers.TransactionRequest
    ): Promise<ethers.providers.TransactionResponse> {
        const address = asset.ethereumAddress.toLocalAddressString();
        return this.functions.swapEtherToToken(address, minConversionRate, overrides);
    }

    public trade(
        src: ERC20Asset,
        srcAmount: ethers.utils.BigNumber,
        dest: ERC20Asset,
        recipient: Address,
        maxDestAmount: ethers.utils.BigNumber,
        minConversionRate: ethers.utils.BigNumber,
        walletId: Address = KyberNetworkProxy.WALLET_ID,
        overrides?: ethers.providers.TransactionRequest
    ): Promise<ethers.providers.TransactionResponse> {
        const srcAddress = src.ethereumAddress.isZero()
            ? KyberNetworkProxy.ETHEREUM_ADDRESS
            : src.ethereumAddress.toLocalAddressString();
        const destAddress = dest.ethereumAddress.isZero()
            ? KyberNetworkProxy.ETHEREUM_ADDRESS
            : dest.ethereumAddress.toLocalAddressString();
        return this.functions.trade(
            srcAddress,
            srcAmount,
            destAddress,
            recipient.toLocalAddressString(),
            maxDestAmount,
            minConversionRate,
            walletId.toLocalAddressString(),
            overrides
        );
    }
}
export default KyberNetworkProxy;
