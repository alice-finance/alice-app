import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";

import { ethers } from "ethers";
import { Toast } from "native-base";
import { NULL_ADDRESS } from "../constants/token";
import { BalancesContext } from "../contexts/BalancesContext";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import Address from "../evm/Address";

const useETHDepositor = () => {
    const { t } = useTranslation("asset");
    const { ethereumConnector } = useContext(ConnectorContext);
    const { addPendingDepositTransaction, clearPendingDepositTransaction } = useContext(PendingTransactionsContext);
    const { getBalance, updateBalance } = useContext(BalancesContext);
    const deposit = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (ethereumConnector) {
                const ethereumAddress = Address.newEthereumAddress(NULL_ADDRESS);
                const loomAddress = Address.newLoomAddress(NULL_ADDRESS);
                const onError = e => {
                    clearPendingDepositTransaction(ethereumAddress);
                    Toast.show({ text: t("depositChangeFailure") });
                };
                try {
                    clearPendingDepositTransaction(ethereumAddress);
                    const gateway = ethereumConnector.getERC20Gateway();
                    const tx = await ethereumConnector.wallet.sendTransaction({
                        to: gateway.address,
                        value: amount
                    });
                    addPendingDepositTransaction(ethereumAddress, tx);
                    await tx.wait();
                    clearPendingDepositTransaction(ethereumAddress);
                    updateBalance(ethereumAddress, getBalance(ethereumAddress).sub(amount));
                    updateBalance(loomAddress, getBalance(loomAddress).add(amount));
                    Toast.show({ text: t("depositChangeSuccess") });
                } catch (e) {
                    onError(e);
                }
            }
        },
        [ethereumConnector, addPendingDepositTransaction, clearPendingDepositTransaction]
    );
    return { deposit };
};

export default useETHDepositor;
