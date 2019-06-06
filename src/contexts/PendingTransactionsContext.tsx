import React, { useCallback, useState } from "react";

import Address from "../evm/Address";

export const PendingTransactionsContext = React.createContext({
    getPendingDepositTransactions: (address: Address) => [] as string[],
    addPendingDepositTransaction: (address: Address, hash: string) => {},
    removePendingDepositTransaction: (address: Address, hash: string) => {},
    clearPendingDepositTransaction: (address: Address) => {},
    getPendingWithdrawalTransactions: (address: Address) => [] as string[],
    addPendingWithdrawalTransaction: (address: Address, hash: string) => {},
    removePendingWithdrawalTransaction: (address: Address, hash: string) => {},
    clearPendingWithdrawalTransaction: (address: Address) => {}
});

export const PendingTransactionsProvider = ({ children }) => {
    const [pendingDepositTransactions, setPendingDepositTransactions] = useState({} as {
        [addressString: string]: string[];
    });
    const [pendingWithdrawalTransactions, setPendingWithdrawalTransactions] = useState({} as {
        [addressString: string]: string[];
    });
    const getPendingDepositTransactions = useCallback(
        (address: Address) => {
            return pendingDepositTransactions[address.toString()] || [];
        },
        [pendingDepositTransactions]
    );
    const addPendingDepositTransaction = useCallback(
        (address: Address, hash: string) => {
            const transactions = pendingDepositTransactions[address.toString()] || [];
            transactions.push(hash);
            setPendingDepositTransactions({ ...pendingDepositTransactions, [address.toString()]: transactions });
        },
        [pendingDepositTransactions]
    );
    const removePendingDepositTransaction = useCallback(
        (address: Address, hash: string) => {
            const transactions = pendingDepositTransactions[address.toString()] || [];
            setPendingDepositTransactions({
                ...pendingDepositTransactions,
                [address.toString()]: transactions.filter(h => h !== hash)
            });
        },
        [pendingDepositTransactions]
    );
    const clearPendingDepositTransaction = useCallback(
        (address: Address) => {
            setPendingDepositTransactions({ ...pendingDepositTransactions, [address.toString()]: [] });
        },
        [pendingDepositTransactions]
    );
    const getPendingWithdrawalTransactions = useCallback(
        (address: Address) => {
            return pendingWithdrawalTransactions[address.toString()] || [];
        },
        [pendingWithdrawalTransactions]
    );
    const addPendingWithdrawalTransaction = useCallback(
        (address: Address, hash: string) => {
            const transactions = pendingWithdrawalTransactions[address.toString()] || [];
            transactions.push(hash);
            setPendingWithdrawalTransactions({ ...pendingWithdrawalTransactions, [address.toString()]: transactions });
        },
        [pendingWithdrawalTransactions]
    );
    const removePendingWithdrawalTransaction = useCallback(
        (address: Address, hash: string) => {
            const transactions = pendingWithdrawalTransactions[address.toString()] || [];
            setPendingWithdrawalTransactions({
                ...pendingWithdrawalTransactions,
                [address.toString()]: transactions.filter(h => h !== hash)
            });
        },
        [pendingWithdrawalTransactions]
    );
    const clearPendingWithdrawalTransaction = useCallback(
        (address: Address) => {
            setPendingWithdrawalTransactions({ ...pendingWithdrawalTransactions, [address.toString()]: [] });
        },
        [pendingWithdrawalTransactions]
    );
    return (
        <PendingTransactionsContext.Provider
            value={{
                getPendingDepositTransactions,
                addPendingDepositTransaction,
                removePendingDepositTransaction,
                clearPendingDepositTransaction,
                getPendingWithdrawalTransactions,
                addPendingWithdrawalTransaction,
                removePendingWithdrawalTransaction,
                clearPendingWithdrawalTransaction
            }}>
            {children}
        </PendingTransactionsContext.Provider>
    );
};

export const PendingTransactionsConsumer = PendingTransactionsContext.Consumer;
