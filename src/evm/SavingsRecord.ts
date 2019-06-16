import { ethers } from "ethers";

export default interface SavingsRecord {
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
