import React, { useCallback, useContext } from "react";

import Address from "@alice-finance/alice.js/dist/Address";
import { ZERO_ADDRESS } from "@alice-finance/alice.js/dist/constants";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { bytesToHexAddr } from "loom-js/dist/crypto-utils";
import { AssetContext } from "../contexts/AssetContext";
import { ChainContext } from "../contexts/ChainContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import useTokenBalanceUpdater from "./useTokenBalanceUpdater";

const usePendingWithdrawalHandler = () => {
    const { assets } = useContext(AssetContext);
    const { loomChain, ethereumChain } = useContext(ChainContext);
    const { addPendingWithdrawalTransaction, clearPendingWithdrawalTransactions } = useContext(
        PendingTransactionsContext
    );
    const { update } = useTokenBalanceUpdater();
    const handlePendingWithdrawal = useCallback(async () => {
        if (loomChain && ethereumChain) {
            const ethereumNonce = await ethereumChain.getWithdrawalNonceAsync();
            let receipt = await loomChain.getPendingETHWithdrawalReceipt(ethereumNonce);
            if (receipt) {
                const ethereumAddress = Address.createEthereumAddress(ZERO_ADDRESS);
                clearPendingWithdrawalTransactions(ethereumAddress);
                const withdrawTx = await ethereumChain.withdrawETHAsync(
                    toBigNumber(receipt.tokenAmount.toString()),
                    bytesToHexAddr(receipt.oracleSignature)
                );
                addPendingWithdrawalTransaction(ethereumAddress, withdrawTx);
                await withdrawTx.wait();
                await update();
                clearPendingWithdrawalTransactions(ethereumAddress);
            }
            receipt = await loomChain.getPendingERC20WithdrawalReceipt(ethereumNonce);
            if (receipt) {
                const ethereumAddress = Address.fromString(receipt.tokenContract.toString());
                const asset = assets.find(a => a.ethereumAddress.equals(ethereumAddress));
                if (asset) {
                    const withdrawTx = await ethereumChain.withdrawERC20Async(
                        asset,
                        toBigNumber(receipt.tokenAmount.toString()),
                        bytesToHexAddr(receipt.oracleSignature)
                    );
                    addPendingWithdrawalTransaction(ethereumAddress, withdrawTx);
                    await withdrawTx.wait();
                    await update();
                    clearPendingWithdrawalTransactions(ethereumAddress);
                }
            }
            if (!receipt) {
                assets.forEach(token => clearPendingWithdrawalTransactions(token.ethereumAddress));
            }
        }
    }, [loomChain, ethereumChain, assets]);
    return { handlePendingWithdrawal };
};

export default usePendingWithdrawalHandler;
