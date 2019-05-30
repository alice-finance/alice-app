import React, { useCallback, useState } from "react";

import BN from "bn.js";

export const BalancesContext = React.createContext({
    loomBalances: {} as { [address: string]: BN },
    setLoomBalances: (balances: { [address: string]: BN }) => {},
    updateLoomBalance: (address: string, balance: BN) => {},
    ethereumBalances: {} as { [address: string]: BN },
    setEthereumBalances: (balances: { [address: string]: BN }) => {},
    updateEthereumBalance: (address: string, balance: BN) => {}
});

export const BalancesProvider = ({ children }) => {
    const [loomBalances, setLoomBalances] = useState({} as { [address: string]: BN });
    const updateLoomBalance = useCallback((address: string, balance: BN) => {
        setLoomBalances({ ...loomBalances, [address]: balance });
    }, []);
    const [ethereumBalances, setEthereumBalances] = useState({} as { [address: string]: BN });
    const updateEthereumBalance = useCallback((address: string, balance: BN) => {
        setEthereumBalances({ ...ethereumBalances, [address]: balance });
    }, []);
    return (
        <BalancesContext.Provider
            value={{
                loomBalances,
                setLoomBalances,
                updateLoomBalance,
                ethereumBalances,
                setEthereumBalances,
                updateEthereumBalance
            }}>
            {children}
        </BalancesContext.Provider>
    );
};

export const BalancesConsumer = BalancesContext.Consumer;
