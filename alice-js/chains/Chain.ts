import { ethers } from "ethers";
import Address from "../Address";
import ERC20Asset from "../ERC20Asset";

interface Chain {
    getProvider: () => ethers.providers.JsonRpcProvider;
    getSigner: () => ethers.Signer;
    getAddress: () => Address;
    balanceOfETHAsync: () => Promise<ethers.utils.BigNumber>;
    transferETHAsync: (to: string, amount: ethers.utils.BigNumber) => Promise<ethers.providers.TransactionResponse>;
    approveETHAsync: (spender: string, amount: ethers.utils.BigNumber) => Promise<ethers.providers.TransactionResponse>;
    balanceOfERC20Async: (asset: ERC20Asset) => Promise<ethers.utils.BigNumber>;
    transferERC20Async: (
        asset: ERC20Asset,
        to: string,
        amount: ethers.utils.BigNumber
    ) => Promise<ethers.providers.TransactionResponse>;
    approveERC20Async: (
        asset: ERC20Asset,
        spender: string,
        amount: ethers.utils.BigNumber
    ) => Promise<ethers.providers.TransactionResponse>;
    updateAssetBalancesAsync: (
        assets: ERC20Asset[],
        updateBalance: (address: Address, balance: ethers.utils.BigNumber) => void
    ) => Promise<void[]>;
}

export default Chain;
