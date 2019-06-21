import React, { useCallback, useContext } from "react";

import { BN } from "bn.js";
import { ethers } from "ethers";
import { TransferGateway } from "loom-js/dist/contracts";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import ERC20Token from "../evm/ERC20Token";
import { listenToTokenWithdrawal } from "../utils/loom-utils";
import useTokenBalanceUpdater from "./useTokenBalanceUpdater";

const useERC20Withdrawer = (asset: ERC20Token) => {
    const { loomConnector, ethereumConnector } = useContext(ConnectorContext);
    const { addPendingWithdrawalTransaction, clearPendingWithdrawalTransactions } = useContext(
        PendingTransactionsContext
    );
    const { update } = useTokenBalanceUpdater();
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
                    // Step 3: listen to token withdrawal event
                    const ethereumGateway = ethereumConnector!.getGateway();
                    const signature = await listenToTokenWithdrawal(
                        gateway,
                        asset.ethereumAddress,
                        ethereumConnector!.address
                    );
                    // Step 4: withdraw from ethereum network
                    const withdrawTx = await ethereumGateway.withdrawERC20(
                        amount.toString(),
                        signature,
                        asset.ethereumAddress.toLocalAddressString()
                    );
                    addPendingWithdrawalTransaction(ethereumAddress, withdrawTx);
                    await withdrawTx.wait();
                    await update();
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
