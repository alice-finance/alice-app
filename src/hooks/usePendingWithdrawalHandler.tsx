import React, { useCallback, useContext } from "react";

import { bytesToHexAddr } from "loom-js/dist/crypto-utils";
import { TransferGatewayTokenKind } from "loom-js/dist/proto/transfer_gateway_pb";
import { NULL_ADDRESS } from "../constants/token";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import { TokensContext } from "../contexts/TokensContext";
import Address from "../evm/Address";
import { toBigNumber } from "../utils/big-number-utils";
import useTokenBalanceUpdater from "./useTokenBalanceUpdater";

const usePendingWithdrawalHandler = () => {
    const { tokens } = useContext(TokensContext);
    const { loomConnector, ethereumConnector, transferGateway: loomGateway } = useContext(ConnectorContext);
    const { addPendingWithdrawalTransaction, clearPendingWithdrawalTransactions } = useContext(
        PendingTransactionsContext
    );
    const { update } = useTokenBalanceUpdater();
    const handlePendingWithdrawal = useCallback(async () => {
        const ethereumGateway = ethereumConnector!.getGateway();
        const receipt = await loomGateway!.withdrawalReceiptAsync(loomConnector!.address);
        if (receipt) {
            const ethereumNonce = await ethereumGateway.nonces(ethereumConnector!.address.toLocalAddressString());
            const loomNonce = receipt.withdrawalNonce.toString();
            if (toBigNumber(ethereumNonce).eq(toBigNumber(loomNonce))) {
                switch (receipt.tokenKind) {
                    case TransferGatewayTokenKind.ETH: {
                        const ethereumAddress = Address.newEthereumAddress(NULL_ADDRESS);
                        const withdrawTx = await ethereumGateway.withdrawETH(
                            receipt.tokenAmount.toString(),
                            bytesToHexAddr(receipt.oracleSignature)
                        );
                        addPendingWithdrawalTransaction(ethereumAddress, withdrawTx);
                        await withdrawTx.wait();
                        await update();
                        clearPendingWithdrawalTransactions(ethereumAddress);
                        break;
                    }
                    case TransferGatewayTokenKind.ERC20: {
                        const ethereumAddress = Address.fromString(receipt.tokenContract.toString());
                        const withdrawTx = await ethereumGateway.withdrawERC20(
                            receipt.tokenAmount.toString(),
                            bytesToHexAddr(receipt.oracleSignature),
                            receipt.tokenContract.local.toString()
                        );
                        addPendingWithdrawalTransaction(ethereumAddress, withdrawTx);
                        await withdrawTx.wait();
                        await update();
                        clearPendingWithdrawalTransactions(ethereumAddress);
                        break;
                    }
                }
            } else {
                tokens.forEach(token => clearPendingWithdrawalTransactions(token.ethereumAddress));
            }
        } else {
            tokens.forEach(token => clearPendingWithdrawalTransactions(token.ethereumAddress));
        }
    }, [loomConnector, ethereumConnector, tokens]);
    return { handlePendingWithdrawal };
};

export default usePendingWithdrawalHandler;
