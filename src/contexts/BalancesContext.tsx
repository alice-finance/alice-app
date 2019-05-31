import React, { useCallback, useState } from "react";

import BN from "bn.js";
import Address from "../evm/Address";
import { toBN } from "../utils/erc20-utils";

export const BalancesContext = React.createContext({
    getBalance: (address: Address): BN => toBN(0),
    updateBalance: (address: Address, balance: BN) => {}
});

export const BalancesProvider = ({ children }) => {
    const [balances, setBalances] = useState({} as { [address: string]: BN });
    const getBalance = useCallback(
        (address: Address): BN => {
            return balances[address.toString()] ? toBN(balances[address.toString()]) : toBN(0);
        },
        [balances]
    );
    const updateBalance = useCallback((address: Address, balance: BN) => {
        setBalances({ ...balances, [address.toString()]: balance });
    }, []);
    return (
        <BalancesContext.Provider
            value={{
                getBalance,
                setBalances,
                updateBalance
            }}>
            {children}
        </BalancesContext.Provider>
    );
};

export const BalancesConsumer = BalancesContext.Consumer;
