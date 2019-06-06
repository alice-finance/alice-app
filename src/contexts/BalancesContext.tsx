import React, { useCallback, useState } from "react";

import { ethers } from "ethers";
import Address from "../evm/Address";
import { toBigNumber } from "../utils/big-number-utils";

export const BalancesContext = React.createContext({
    getBalance: (address: Address): ethers.utils.BigNumber => toBigNumber(0),
    updateBalance: (address: Address, balance: ethers.utils.BigNumber) => {}
});

export const BalancesProvider = ({ children }) => {
    const [balances, setBalances] = useState({} as { [address: string]: ethers.utils.BigNumber });
    const getBalance = useCallback(
        (address: Address): ethers.utils.BigNumber => {
            return balances[address.toString()] ? toBigNumber(balances[address.toString()]) : toBigNumber(0);
        },
        [balances]
    );
    const updateBalance = (address: Address, balance: ethers.utils.BigNumber) =>
        setBalances(oldBalances => ({ ...oldBalances, [address.toString()]: balance }));
    return (
        <BalancesContext.Provider
            value={{
                getBalance,
                updateBalance
            }}>
            {children}
        </BalancesContext.Provider>
    );
};

export const BalancesConsumer = BalancesContext.Consumer;
