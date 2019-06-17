import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "react-navigation-hooks";

import { ethers } from "ethers";
import { Toast } from "native-base";
import { BalancesContext } from "../contexts/BalancesContext";
import { ConnectorContext } from "../contexts/ConnectorContext";
import ERC20Token from "../evm/ERC20Token";
import useMySavingsUpdater from "./useMySavingsUpdater";

const useSavingsStarter = (asset: ERC20Token | null, amount: ethers.utils.BigNumber | null) => {
    const { pop } = useNavigation();
    const { t } = useTranslation("finance");
    const { loomConnector } = useContext(ConnectorContext);
    const { updateBalance } = useContext(BalancesContext);
    const [starting, setStarting] = useState(false);
    const { update } = useMySavingsUpdater();
    const start = async () => {
        if (loomConnector && asset && amount) {
            setStarting(true);
            try {
                const market = loomConnector.getMoneyMarket();
                const erc20 = loomConnector.getERC20(asset!.loomAddress.toLocalAddressString());
                const approveTx = await erc20.approve(market.address, amount, { gasLimit: 0 });
                await approveTx.wait();
                const depositTx = await market.deposit(amount, { gasLimit: 0 });
                await depositTx.wait();
                await loomConnector.fetchERC20Balances([asset!], updateBalance);
                await update();
                Toast.show({ text: t("aNewSavingsStartToday") });
                pop();
            } catch (e) {
                Toast.show({ text: t("savingsFailure") });
            } finally {
                setStarting(false);
            }
        }
    };
    return { starting, start };
};

export default useSavingsStarter;
