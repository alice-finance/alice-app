import React, { useCallback, useState } from "react";

import { ethers } from "ethers";
import Address from "../evm/Address";

export const PendingTransactionsContext = React.createContext({
    getPendingDepositTransactions: (address: Address) => [] as ethers.providers.TransactionResponse[],
    addPendingDepositTransaction: (address: Address, tx: ethers.providers.TransactionResponse) => {},
    removePendingDepositTransaction: (address: Address, hash: string) => {},
    clearPendingDepositTransaction: (address: Address) => {},
    getPendingWithdrawalTransactions: (address: Address) => [] as any[],
    addPendingWithdrawalTransaction: (address: Address, tx: any) => {},
    removePendingWithdrawalTransaction: (address: Address, hash: string) => {},
    clearPendingWithdrawalTransaction: (address: Address) => {}
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
    const clearPendingDepositTransaction = useCallback(
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
    const clearPendingWithdrawalTransaction = useCallback(
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
