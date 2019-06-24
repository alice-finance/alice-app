import React, { useCallback, useState } from "react";

import { ethers } from "ethers";
import Address from "../../alice-js/Address";

export const PendingTransactionsContext = React.createContext({
    getPendingDepositTransactions: (address: Address) => [] as ethers.providers.TransactionResponse[],
    addPendingDepositTransaction: (address: Address, tx: ethers.providers.TransactionResponse) => {},
    removePendingDepositTransaction: (address: Address, hash: string) => {},
    clearPendingDepositTransactions: (address: Address) => {},
    getPendingWithdrawalTransactions: (address: Address) => [] as any[],
    addPendingWithdrawalTransaction: (address: Address, tx: any) => {},
    removePendingWithdrawalTransaction: (address: Address, hash: string) => {},
    clearPendingWithdrawalTransactions: (address: Address) => {}
});

export const PendingTransactionsProvider = ({ children }) => {
    const [pendingDepositTransactions, setPendingDepositTransactions] = useState({} as {
        [addressString: string]: ethers.providers.TransactionResponse[];
    });
    const [pendingWithdrawalTransactions, setPendingWithdrawalTransactions] = useState({} as {
        [addressString: string]: ethers.providers.TransactionResponse[];
    });
    const getPendingDepositTransactions = useCallback(
        (address: Address) => {
            return pendingDepositTransactions[address.toString()] || [];
        },
        [pendingDepositTransactions]
    );
    const addPendingDepositTransaction = useCallback(
        (address: Address, tx: ethers.providers.TransactionResponse) => {
            const transactions = pendingDepositTransactions[address.toString()] || [];
            transactions.push(tx);
            setPendingDepositTransactions(oldState => ({ ...oldState, [address.toString()]: transactions }));
        },
        [pendingDepositTransactions]
    );
    const removePendingDepositTransaction = useCallback(
        (address: Address, hash: string) => {
            const transactions = pendingDepositTransactions[address.toString()] || [];
            setPendingDepositTransactions(oldState => ({
                ...oldState,
                [address.toString()]: transactions.filter(tx => tx.hash !== hash)
            }));
        },
        [pendingDepositTransactions]
    );
    const clearPendingDepositTransactions = useCallback(
        (address: Address) => {
            setPendingDepositTransactions(oldState => ({ ...oldState, [address.toString()]: [] }));
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
        (address: Address, tx: any) => {
            const transactions = pendingWithdrawalTransactions[address.toString()] || [];
            transactions.push(tx);
            setPendingWithdrawalTransactions(oldState => ({ ...oldState, [address.toString()]: transactions }));
        },
        [pendingWithdrawalTransactions]
    );
    const removePendingWithdrawalTransaction = useCallback(
        (address: Address, hash: string) => {
            const transactions = pendingWithdrawalTransactions[address.toString()] || [];
            setPendingWithdrawalTransactions(oldState => ({
                ...oldState,
                [address.toString()]: transactions.filter(tx => tx.hash !== hash)
            }));
        },
        [pendingWithdrawalTransactions]
    );
    const clearPendingWithdrawalTransactions = useCallback(
        (address: Address) => {
            setPendingWithdrawalTransactions(oldState => ({ ...oldState, [address.toString()]: [] }));
        },
        [pendingWithdrawalTransactions]
    );
    return (
        <PendingTransactionsContext.Provider
            value={{
                getPendingDepositTransactions,
                addPendingDepositTransaction,
                removePendingDepositTransaction,
                clearPendingDepositTransactions,
                getPendingWithdrawalTransactions,
                addPendingWithdrawalTransaction,
                removePendingWithdrawalTransaction,
                clearPendingWithdrawalTransactions
            }}>
            {children}
        </PendingTransactionsContext.Provider>
    );
};

export const PendingTransactionsConsumer = PendingTransactionsContext.Consumer;
