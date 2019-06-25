import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "react-navigation-hooks";

import { ethers } from "ethers";
import { Toast } from "native-base";
import ERC20Asset from "../../alice-js/ERC20Asset";
import { ChainContext } from "../contexts/ChainContext";
import useMySavingsUpdater from "./useMySavingsUpdater";
import useTokenBalanceUpdater from "./useTokenBalanceUpdater";

const useSavingsStarter = (asset: ERC20Asset | null, amount: ethers.utils.BigNumber | null) => {
    const { pop } = useNavigation();
    const { t } = useTranslation("finance");
    const { loomChain } = useContext(ChainContext);
    const [starting, setStarting] = useState(false);
    const { update: updateTokenBalances } = useTokenBalanceUpdater();
    const { update: updateMySavings } = useMySavingsUpdater();
    const start = async () => {
        if (loomChain && asset && amount) {
            setStarting(true);
            try {
                const market = loomChain.createMoneyMarket();
                const approveTx = await loomChain.approveERC20Async(asset, market.address, amount);
                await approveTx.wait();
                const depositTx = await market.deposit(amount);
                await depositTx.wait();
                await updateTokenBalances();
                await updateMySavings();
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
