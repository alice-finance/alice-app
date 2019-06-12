import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";

import { BN } from "bn.js";
import { ethers } from "ethers";
import { TransferGateway } from "loom-js/dist/contracts";
import { Toast } from "native-base";
import { NULL_ADDRESS } from "../constants/token";
import { BalancesContext } from "../contexts/BalancesContext";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import Address from "../evm/Address";
import ERC20Token from "../evm/ERC20Token";

const useERC20Withdrawer = (asset: ERC20Token) => {
    const { t } = useTranslation("asset");
    const { loomConnector, ethereumConnector } = useContext(ConnectorContext);
    const { addPendingWithdrawalTransaction, clearPendingWithdrawalTransaction } = useContext(
        PendingTransactionsContext
    );
    const { getBalance, updateBalance } = useContext(BalancesContext);
    const withdraw = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (loomConnector && ethereumConnector) {
                const ethereumAddress = Address.newEthereumAddress(NULL_ADDRESS);
                const loomAddress = asset.loomAddress;
                const onError = e => {
                    clearPendingWithdrawalTransaction(loomAddress);
                    Toast.show({ text: t("depositChangeFailure") });
                };
                try {
                    clearPendingWithdrawalTransaction(loomAddress);
                    addPendingWithdrawalTransaction(loomAddress, { hash: "1" });
                    const gateway = await TransferGateway.createAsync(loomConnector.client, loomConnector.address);
                    const erc20 = loomConnector.getERC20(loomAddress.toLocalAddressString());
                    const approveTx = await erc20.approve(gateway.address.local.toChecksumString(), amount);
                    await approveTx.wait();
                    addPendingWithdrawalTransaction(loomAddress, { hash: "2" });
                    await gateway.withdrawERC20Async(new BN(amount.toString()), loomAddress);
                    clearPendingWithdrawalTransaction(loomAddress);
                    updateBalance(ethereumAddress, getBalance(ethereumAddress).sub(amount));
                    updateBalance(loomAddress, getBalance(loomAddress).add(amount));
                    Toast.show({ text: t("depositChangeSuccess") });
                } catch (e) {
                    onError(e);
                }
            }
        },
        [loomConnector, ethereumConnector, addPendingWithdrawalTransaction, clearPendingWithdrawalTransaction]
    );
    return { withdraw };
};

export default useERC20Withdrawer;
