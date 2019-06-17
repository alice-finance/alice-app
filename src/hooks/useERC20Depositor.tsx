import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";

import { ethers } from "ethers";
import { Toast } from "native-base";
import { BalancesContext } from "../contexts/BalancesContext";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import ERC20Token from "../evm/ERC20Token";

const useERC20Depositor = (asset: ERC20Token) => {
    const { t } = useTranslation("asset");
    const { ethereumConnector } = useContext(ConnectorContext);
    const { addPendingDepositTransaction, clearPendingDepositTransaction } = useContext(PendingTransactionsContext);
    const { getBalance, updateBalance } = useContext(BalancesContext);
    const deposit = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (ethereumConnector) {
                const assetAddress = asset.ethereumAddress;
                const onError = e => {
                    clearPendingDepositTransaction(assetAddress);
                    if (e.code === "INSUFFICIENT_FUNDS") {
                        let text = t("insufficientFunds");
                        if (e.transaction) {
                            const gas = ethers.utils.formatEther(e.transaction.gasPrice.mul(e.transaction.gasLimit));
                            text = text + " (" + gas + " ETH)";
                        }
                        Toast.show({ text });
                    } else {
                        Toast.show({ text: t("depositChangeFailure") });
                    }
                };
                try {
                    clearPendingDepositTransaction(assetAddress);
                    // Step 1: approve
                    const erc20 = ethereumConnector.getERC20(asset.ethereumAddress.toLocalAddressString());
                    const gateway = ethereumConnector.getGateway();
                    const approveTx = await erc20.approve(gateway.address, amount);
                    addPendingDepositTransaction(assetAddress, approveTx);
                    await approveTx.wait();
                    // Step 2: deposit
                    const depositTx = await gateway.depositERC20(amount, asset.ethereumAddress.toLocalAddressString());
                    addPendingDepositTransaction(assetAddress, depositTx);
                    await depositTx.wait();
                    // Done
                    clearPendingDepositTransaction(assetAddress);
                    updateBalance(asset.ethereumAddress, getBalance(asset.ethereumAddress).sub(amount));
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

export default useERC20Depositor;
