import React, { useState } from "react";

import { ERC20Asset } from "@alice-finance/alice.js/dist";
import { SavingsRecord } from "@alice-finance/alice.js/dist/contracts/MoneyMarket";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { ethers } from "ethers";

export const SavingsContext = React.createContext({
    decimals: 0,
    setDecimals: (decimal: number) => {},
    asset: null as (ERC20Asset | null),
    setAsset: (asset: ERC20Asset) => {},
    totalBalance: null as (ethers.utils.BigNumber | null),
    setTotalBalance: (totalBalance: ethers.utils.BigNumber) => {},
    apr: null as (ethers.utils.BigNumber | null),
    setAPR: (mySavings: ethers.utils.BigNumber) => {},
    myRecords: null as SavingsRecord[] | null,
    setMyRecords: (savingsRecords: SavingsRecord[]) => {},
    myTotalPrincipal: null as ethers.utils.BigNumber | null,
    myTotalBalance: null as ethers.utils.BigNumber | null,
    myTotalWithdrawal: null as ethers.utils.BigNumber | null
});

// tslint:disable-next-line:max-func-body-length
export const SavingsProvider = ({ children }) => {
    const [decimals, setDecimals] = useState(0);
    const [asset, setAsset] = useState<ERC20Asset | null>(null);
    const [totalBalance, setTotalBalance] = useState<ethers.utils.BigNumber | null>(null);
    const [apr, setAPR] = useState<ethers.utils.BigNumber | null>(null);
    const [myRecords, setMyRecords] = useState<SavingsRecord[] | null>(null);
    const myTotalPrincipal = myRecords
        ? myRecords.reduce((previous, current) => previous.add(current.principal), toBigNumber(0))
        : null;
    const myTotalBalance = myRecords
        ? myRecords.reduce((previous, current) => previous.add(current.balance), toBigNumber(0))
        : null;
    const myTotalWithdrawal = myRecords
        ? myRecords.reduce(
              (previous, current) =>
                  previous.add(current.withdrawals.reduce((p, c) => p.add(c.amount), toBigNumber(0))),
              toBigNumber(0)
          )
        : null;
    return (
        <SavingsContext.Provider
            value={{
                decimals,
                setDecimals,
                asset,
                setAsset,
                totalBalance,
                setTotalBalance,
                apr,
                setAPR,
                myRecords,
                setMyRecords,
                myTotalPrincipal,
                myTotalBalance,
                myTotalWithdrawal
            }}>
            {children}
        </SavingsContext.Provider>
    );
};

export const SavingsConsumer = SavingsContext.Consumer;
