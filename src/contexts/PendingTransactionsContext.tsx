import React, { useCallback } from "react";

import Address from "@alice-finance/alice.js/dist/Address";
import { ethers } from "ethers";
import usePersistentState from "../hooks/usePersistentState";

export const PendingTransactionsContext = React.createContext({
    getPendingDepositAddresses: () => [] as Address[],
    getPendingDepositTransactions: (address: Address) => [] as ethers.providers.TransactionResponse[],
    getLastPendingDepositTransaction: (address: Address) => null as ethers.providers.TransactionResponse | null,
    addPendingDepositTransaction: (address: Address, tx: ethers.providers.TransactionResponse) => {},
    confirmPendingDepositTransaction: (address: Address, txReceipt: ethers.providers.TransactionReceipt) => {},
    removePendingDepositTransaction: (address: Address, hash: string) => {},
    clearPendingDepositTransactions: (address: Address) => {},
    getPendingWithdrawalAddresses: () => [] as Address[],
    getPendingWithdrawalTransactions: (address: Address) => [] as any[],
    getLastPendingWithdrawalTransaction: (address: Address) => null as ethers.providers.TransactionResponse | null,
    addPendingWithdrawalTransaction: (address: Address, tx: any) => {},
    confirmPendingWithdrawalTransaction: (address: Address, txReceipt: ethers.providers.TransactionReceipt) => {},
    removePendingWithdrawalTransaction: (address: Address, hash: string) => {},
    clearPendingWithdrawalTransactions: (address: Address) => {}
});

// tslint:disable-next-line:max-func-body-length
export const PendingTransactionsProvider = ({ children }) => {
    const [pendingDepositTransactions, setPendingDepositTransactions] = usePersistentState(
        "pendingDepositTransactions",
        {} as {
            [addressString: string]: ethers.providers.TransactionResponse[];
        }
    );
    const [pendingWithdrawalTransactions, setPendingWithdrawalTransactions] = usePersistentState(
        "pendingWithdrawalTransactions",
        {} as {
            [addressString: string]: ethers.providers.TransactionResponse[];
        }
    );
    const getPendingDepositAddresses = useCallback(
        () =>
            Object.keys(pendingDepositTransactions)
                .map(address => Address.createEthereumAddress(address))
                .filter(address => getPendingDepositTransactions(address).length > 0),
        []
    );
    const getPendingDepositTransactions = useCallback(
        (address: Address) => {
            return pendingDepositTransactions[address.toString()] || [];
        },
        [pendingDepositTransactions]
    );
    const getLastPendingDepositTransaction = useCallback(
        (address: Address) => {
            const transactions = pendingDepositTransactions[address.toString()] || [];
            return transactions.length === 0 ? null : transactions[transactions.length - 1];
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
    const confirmPendingDepositTransaction = useCallback(
        (address: Address, txReceipt: ethers.providers.TransactionReceipt) => {
            const transactions = pendingDepositTransactions[address.toString()] || [];
            const transaction = transactions.find(tx => tx.hash === txReceipt.transactionHash);
            if (transaction) {
                transaction.blockNumber = txReceipt.blockNumber;
                transaction.blockHash = txReceipt.blockHash;
                setPendingDepositTransactions(oldState => ({ ...oldState, [address.toString()]: transactions }));
            }
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
    const getPendingWithdrawalAddresses = useCallback(
        () =>
            Object.keys(pendingWithdrawalTransactions)
                .map(address => Address.createEthereumAddress(address))
                .filter(address => getPendingWithdrawalTransactions(address).length > 0),
        []
    );
    const getPendingWithdrawalTransactions = useCallback(
        (address: Address) => {
            return pendingWithdrawalTransactions[address.toString()] || [];
        },
        [pendingWithdrawalTransactions]
    );
    const getLastPendingWithdrawalTransaction = useCallback(
        (address: Address) => {
            const transactions = pendingWithdrawalTransactions[address.toString()] || [];
            return transactions.length === 0 ? null : transactions[transactions.length - 1];
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
    const confirmPendingWithdrawalTransaction = useCallback(
        (address: Address, txReceipt: ethers.providers.TransactionReceipt) => {
            const transactions = pendingWithdrawalTransactions[address.toString()] || [];
            const transaction = transactions.find(tx => tx.hash === txReceipt.transactionHash);
            if (transaction) {
                transaction.blockNumber = txReceipt.blockNumber;
                transaction.blockHash = txReceipt.blockHash;
                setPendingWithdrawalTransactions(oldState => ({ ...oldState, [address.toString()]: transactions }));
            }
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
                getPendingDepositAddresses,
                getPendingDepositTransactions,
                getLastPendingDepositTransaction,
                addPendingDepositTransaction,
                confirmPendingDepositTransaction,
                removePendingDepositTransaction,
                clearPendingDepositTransactions,
                getPendingWithdrawalAddresses,
                getPendingWithdrawalTransactions,
                getLastPendingWithdrawalTransaction,
                addPendingWithdrawalTransaction,
                confirmPendingWithdrawalTransaction,
                removePendingWithdrawalTransaction,
                clearPendingWithdrawalTransactions
            }}>
            {children}
        </PendingTransactionsContext.Provider>
    );
};

export const PendingTransactionsConsumer = PendingTransactionsContext.Consumer;
