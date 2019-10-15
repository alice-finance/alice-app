import React, { useCallback, useState } from "react";

import { Address } from "@alice-finance/alice.js/dist";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { ethers } from "ethers";

export const BalancesContext = React.createContext({
    lastUpdated: null as Date | null,
    getBalance: (address: Address): ethers.utils.BigNumber => toBigNumber(0),
    updateBalance: (address: Address, balance: ethers.utils.BigNumber) => {}
});

export const BalancesProvider = ({ children }) => {
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [balances, setBalances] = useState({} as { [address: string]: ethers.utils.BigNumber });
    const getBalance = useCallback(
        (address: Address): ethers.utils.BigNumber => {
            return balances[address.toString()] ? toBigNumber(balances[address.toString()]) : toBigNumber(0);
        },
        [balances]
    );
    const updateBalance = (address: Address, balance: ethers.utils.BigNumber) => {
        setBalances(oldBalances => ({ ...oldBalances, [address.toString()]: balance }));
        setLastUpdated(new Date());
    };
    return (
        <BalancesContext.Provider
            value={{
                lastUpdated,
                getBalance,
                updateBalance
            }}>
            {children}
        </BalancesContext.Provider>
    );
};

export const BalancesConsumer = BalancesContext.Consumer;
