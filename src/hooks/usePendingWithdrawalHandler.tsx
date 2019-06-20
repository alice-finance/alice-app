import React, { useCallback, useContext } from "react";

import { TransferGateway } from "loom-js/dist/contracts";
import { bytesToHexAddr } from "loom-js/dist/crypto-utils";
import { TransferGatewayTokenKind } from "loom-js/dist/proto/transfer_gateway_pb";
import { NULL_ADDRESS } from "../constants/token";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import { TokensContext } from "../contexts/TokensContext";
import Address from "../evm/Address";
import useTokenBalanceUpdater from "./useTokenBalanceUpdater";

const usePendingWithdrawalHandler = () => {
    const { tokens } = useContext(TokensContext);
    const { loomConnector, ethereumConnector } = useContext(ConnectorContext);
    const { addPendingWithdrawalTransaction, clearPendingWithdrawalTransactions } = useContext(
        PendingTransactionsContext
    );
    const { update } = useTokenBalanceUpdater();
    const handlePendingWithdrawal = useCallback(async () => {
        const ethereumGateway = ethereumConnector!.getGateway();
        const loomGateway = await TransferGateway.createAsync(loomConnector!.client, loomConnector!.address);
        const receipt = await loomGateway.withdrawalReceiptAsync(loomConnector!.address);
        if (receipt) {
            switch (receipt.tokenKind) {
                case TransferGatewayTokenKind.ETH: {
                    const ethereumAddress = Address.newEthereumAddress(NULL_ADDRESS);
                    addPendingWithdrawalTransaction(ethereumAddress, { hash: "3" });
                    const withdrawTx = await ethereumGateway.withdrawETH(
                        receipt.value.toString(),
                        bytesToHexAddr(receipt.oracleSignature)
                    );
                    await withdrawTx.wait();
                    await update();
                    clearPendingWithdrawalTransactions(ethereumAddress);
                    break;
                }
                case TransferGatewayTokenKind.ERC20: {
                    const ethereumAddress = Address.fromString(receipt.tokenContract.toString());
                    addPendingWithdrawalTransaction(ethereumAddress, { hash: "3" });
                    const withdrawTx = await ethereumGateway.withdrawERC20(
                        receipt.tokenAmount.toString(),
                        bytesToHexAddr(receipt.oracleSignature),
                        receipt.tokenContract.local.toString()
                    );
                    await withdrawTx.wait();
                    await update();
                    clearPendingWithdrawalTransactions(ethereumAddress);
                    break;
                }
            }
        }
    }, [loomConnector, ethereumConnector, tokens]);
    return { handlePendingWithdrawal };
};

export default usePendingWithdrawalHandler;
