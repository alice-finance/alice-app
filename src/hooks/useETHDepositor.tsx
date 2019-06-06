import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";

import { ethers } from "ethers";
import { Toast } from "native-base";
import { NULL_ADDRESS } from "../constants/token";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import Address from "../evm/Address";

const useETHDepositor = () => {
    const { t } = useTranslation("asset");
    const { ethereumConnector } = useContext(ConnectorContext);
    const { addPendingDepositTransaction, clearPendingDepositTransaction } = useContext(PendingTransactionsContext);
    const deposit = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (ethereumConnector) {
                const assetAddress = Address.newEthereumAddress(NULL_ADDRESS);
                const onError = e => {
                    clearPendingDepositTransaction(assetAddress);
                    Toast.show({ text: t("depositChangeFailure") });
                };
                try {
                    clearPendingDepositTransaction(assetAddress);
                    const gateway = ethereumConnector.getERC20Gateway();
                    const tx = await ethereumConnector.wallet.sendTransaction({
                        to: gateway.address,
                        value: amount
                    });
                    addPendingDepositTransaction(assetAddress, tx);
                    await tx.wait();
                    clearPendingDepositTransaction(assetAddress);
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
