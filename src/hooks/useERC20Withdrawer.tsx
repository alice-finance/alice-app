import React, { useCallback, useContext } from "react";

import { BN } from "bn.js";
import { ethers } from "ethers";
import { TransferGateway } from "loom-js/dist/contracts";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import ERC20Token from "../evm/ERC20Token";
import usePendingWithdrawalHandler from "./usePendingWithdrawalHandler";

const useERC20Withdrawer = (asset: ERC20Token) => {
    const { loomConnector, ethereumConnector } = useContext(ConnectorContext);
    const { addPendingWithdrawalTransaction, clearPendingWithdrawalTransactions } = useContext(
        PendingTransactionsContext
    );
    const { handlePendingWithdrawal } = usePendingWithdrawalHandler();
    const withdraw = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (loomConnector && ethereumConnector) {
                const ethereumAddress = asset.ethereumAddress;
                try {
                    clearPendingWithdrawalTransactions(ethereumAddress);
                    const gateway = await TransferGateway.createAsync(loomConnector.client, loomConnector.address);
                    const erc20 = loomConnector.getERC20(asset.loomAddress.toLocalAddressString());
                    // Step 1: approve
                    addPendingWithdrawalTransaction(ethereumAddress, { hash: "1" });
                    const approveTx = await erc20.approve(gateway.address.local.toChecksumString(), amount, {
                        gasLimit: 0
                    });
                    await approveTx.wait();
                    // Step 2: withdraw from loom network
                    addPendingWithdrawalTransaction(ethereumAddress, { hash: "2" });
                    await gateway.withdrawERC20Async(new BN(amount.toString()), asset.loomAddress);
                    // Step 3: withdraw from ethereum network
                    await handlePendingWithdrawal();
                } catch (e) {
                    clearPendingWithdrawalTransactions(ethereumAddress);
                    throw e;
                }
            }
        },
        [loomConnector, ethereumConnector, addPendingWithdrawalTransaction, clearPendingWithdrawalTransactions]
    );
    return { withdraw };
};

export default useERC20Withdrawer;
