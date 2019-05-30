import React, { useCallback, useState } from "react";

import BN from "bn.js";
import { toBN } from "../utils/erc20-utils";

export const BalancesContext = React.createContext({
    getLoomBalance: (address: string): BN => toBN(0),
    setLoomBalances: (balances: { [address: string]: BN }) => {},
    getEthereumBalance: (address: string): BN => toBN(0),
    setEthereumBalances: (balances: { [address: string]: BN }) => {},
    updateEthereumBalance: (address: string, balance: BN) => {}
});

export const BalancesProvider = ({ children }) => {
    const [loomBalances, setLoomBalances] = useState({} as { [address: string]: BN });
    const getLoomBalance = useCallback(
        (address: string): BN => {
            return loomBalances[address] ? toBN(loomBalances[address]) : toBN(0);
        },
        [loomBalances]
    );
    const updateLoomBalance = useCallback((address: string, balance: BN) => {
        setLoomBalances({ ...loomBalances, [address]: balance });
    }, []);
    const [ethereumBalances, setEthereumBalances] = useState({} as { [address: string]: BN });
    const getEthereumBalance = useCallback(
        (address: string): BN => {
            return ethereumBalances[address] ? toBN(ethereumBalances[address]) : toBN(0);
        },
        [ethereumBalances]
    );
    const updateEthereumBalance = useCallback((address: string, balance: BN) => {
        setEthereumBalances({ ...ethereumBalances, [address]: balance });
    }, []);
    return (
        <BalancesContext.Provider
            value={{
                getLoomBalance,
                setLoomBalances,
                updateLoomBalance,
                getEthereumBalance,
                setEthereumBalances,
                updateEthereumBalance
            }}>
            {children}
        </BalancesContext.Provider>
    );
};

export const BalancesConsumer = BalancesContext.Consumer;
