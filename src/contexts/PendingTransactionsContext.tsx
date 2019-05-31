import React, { useCallback, useState } from "react";

import Transaction from "../evm/Transaction";

export const PendingTransactionsContext = React.createContext({
    getPendingDepositTransactions: (assetAddress: string) => [] as Transaction[],
    addPendingDepositTransaction: (assetAddress: string, tx: Transaction) => {},
    removePendingDepositTransaction: (assetAddress: string, hash: string) => {},
    getPendingWithdrawalTransactions: (assetAddress: string) => [] as Transaction[],
    addPendingWithdrawalTransaction: (assetAddress: string, tx: Transaction) => {},
    removePendingWithdrawalTransaction: (assetAddress: string, hash: string) => {}
});

export const PendingTransactionsProvider = ({ children }) => {
    const [pendingDepositTransactions, setPendingDepositTransactions] = useState({} as {
        [addressString: string]: Transaction[];
    });
    const [pendingWithdrawalTransactions, setPendingWithdrawalTransactions] = useState({} as {
        [addressString: string]: Transaction[];
    });
    const getPendingDepositTransactions = useCallback(
        (assetAddress: string) => {
            return pendingDepositTransactions[assetAddress] || [];
        },
        [pendingDepositTransactions]
    );
    const addPendingDepositTransaction = useCallback(
        (assetAddress: string, tx: Transaction) => {
            const transactions = pendingDepositTransactions[assetAddress] || [];
            transactions.push(tx);
            setPendingDepositTransactions({
                ...pendingDepositTransactions,
                [assetAddress]: transactions
            });
        },
        [pendingDepositTransactions]
    );
    const removePendingDepositTransaction = useCallback(
        (assetAddress: string, hash: string) => {
            const transactions = pendingDepositTransactions[assetAddress] || [];
            setPendingDepositTransactions({
                ...pendingDepositTransactions,
                [assetAddress]: transactions.filter(tx => tx.hash !== hash)
            });
        },
        [pendingDepositTransactions]
    );
    const getPendingWithdrawalTransactions = useCallback(
        (assetAddress: string) => {
            return pendingWithdrawalTransactions[assetAddress] || [];
        },
        [pendingWithdrawalTransactions]
    );
    const addPendingWithdrawalTransaction = useCallback(
        (assetAddress: string, tx: Transaction) => {
            const transactions = pendingWithdrawalTransactions[assetAddress] || [];
            transactions.push(tx);
            setPendingWithdrawalTransactions({
                ...pendingWithdrawalTransactions,
                [assetAddress]: transactions
            });
        },
        [pendingWithdrawalTransactions]
    );
    const removePendingWithdrawalTransaction = useCallback(
        (assetAddress: string, hash: string) => {
            const transactions = pendingWithdrawalTransactions[assetAddress] || [];
            setPendingWithdrawalTransactions({
                ...pendingWithdrawalTransactions,
                [assetAddress]: transactions.filter(tx => tx.hash !== hash)
            });
        },
        [pendingWithdrawalTransactions]
    );
    return (
        <PendingTransactionsContext.Provider
            value={{
                getPendingDepositTransactions,
                addPendingDepositTransaction,
                removePendingDepositTransaction,
                getPendingWithdrawalTransactions,
                addPendingWithdrawalTransaction,
                removePendingWithdrawalTransaction
            }}>
            {children}
        </PendingTransactionsContext.Provider>
    );
};

export const PendingTransactionsConsumer = PendingTransactionsContext.Consumer;
