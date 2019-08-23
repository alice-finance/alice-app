import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "react-navigation-hooks";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { ethers } from "ethers";
import { ChainContext } from "../contexts/ChainContext";
import Analytics from "../helpers/Analytics";
import SnackBar from "../utils/SnackBar";
import useMySavingsLoader from "./useMySavingsLoader";
import useTokenBalanceUpdater from "./useTokenBalanceUpdater";

const useSavingsStarter = (asset: ERC20Asset | null, amount: ethers.utils.BigNumber | null) => {
    const { pop } = useNavigation();
    const { t } = useTranslation("finance");
    const { loomChain } = useContext(ChainContext);
    const [starting, setStarting] = useState(false);
    const { update } = useTokenBalanceUpdater();
    const { load } = useMySavingsLoader();
    const start = async () => {
        if (loomChain && asset && amount) {
            setStarting(true);
            try {
                const market = loomChain.getMoneyMarket();
                const approveTx = await loomChain.approveERC20Async(asset, market.address, amount);
                await approveTx.wait();
                const depositTx = await market.deposit(amount);
                await depositTx.wait();
                await update();
                await load();
                SnackBar.success(t("aNewSavingsStartToday"));
                Analytics.track(Analytics.events.SAVINGS_DEPOSITED);
                pop();
            } catch (e) {
                SnackBar.danger(e.message);
            } finally {
                setStarting(false);
            }
        }
    };
    return { starting, start };
};

export default useSavingsStarter;
