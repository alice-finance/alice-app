import { ethers } from "ethers";

export interface SavingsRecord {
    id: ethers.utils.BigNumber;
    interestRate: ethers.utils.BigNumber;
    balance: ethers.utils.BigNumber;
    principal: ethers.utils.BigNumber;
    initialTimestamp: Date;
    lastTimestamp: Date;
    withdrawals: SavingsWithdrawal[];
}

export interface SavingsWithdrawal {
    recordId: ethers.utils.BigNumber;
    amount: ethers.utils.BigNumber;
    timestamp: Date;
}

export default class MoneyMarket extends ethers.Contract {
    constructor(address: string, signerOrProvider: ethers.Signer | ethers.providers.Provider) {
        super(address, require("@alice-finance/money-market/abis/MoneyMarket.json"), signerOrProvider);
    }
}
