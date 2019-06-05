import React, { useState } from "react";

import BN from "bn.js";
import ERC20Token from "../evm/ERC20Token";
import { toBN } from "../utils/bn-utils";

interface SavingsRecord {
    id: BN;
    interestRate: BN;
    balance: BN;
    principal: BN;
    initialTimestamp: Date;
    lastTimestamp: Date;
}

export const SavingsContext = React.createContext({
    decimals: 0,
    setDecimals: (decimal: number) => {},
    asset: null as (ERC20Token | null),
    setAsset: (asset: ERC20Token) => {},
    totalBalance: null as (BN | null),
    setTotalBalance: (totalBalance: BN) => {},
    apr: null as (BN | null),
    setAPR: (mySavings: BN) => {},
    myRecords: null as SavingsRecord[] | null,
    setMyRecords: (savingsRecords: SavingsRecord[]) => {},
    myTotalPrincipal: null as BN | null,
    myTotalBalance: null as BN | null
});

export const SavingsProvider = ({ children }) => {
    const [decimals, setDecimals] = useState(0);
    const [asset, setAsset] = useState<ERC20Token | null>(null);
    const [totalBalance, setTotalBalance] = useState<BN | null>(null);
    const [apr, setAPR] = useState<BN | null>(null);
    const [myRecords, setMyRecords] = useState<SavingsRecord[] | null>(null);
    const myTotalPrincipal = myRecords
        ? myRecords.reduce((previous, current) => previous.add(current.principal), toBN(0))
        : null;
    const myTotalBalance = myRecords
        ? myRecords.reduce((previous, current) => previous.add(current.balance), toBN(0))
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
                myTotalBalance
            }}>
            {children}
        </SavingsContext.Provider>
    );
};

export const SavingsConsumer = SavingsContext.Consumer;
