import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "react-navigation-hooks";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { ethers } from "ethers";
import { ChainContext } from "../contexts/ChainContext";
import Sentry from "../utils/Sentry";
import SnackBar from "../utils/SnackBar";
import useAssetBalancesUpdater from "./useAssetBalancesUpdater";
import useMySavingsLoader from "./useMySavingsLoader";

const startSavings = async (loomChain, asset, amount) => {
    const market = loomChain.getMoneyMarket();
    const approveTx = await loomChain.approveERC20Async(asset, market.address, amount);
    await approveTx.wait();
    const depositTx = await market.deposit(amount);
    await depositTx.wait();
};

const useSavingsStarter = (asset: ERC20Asset | null, amount: ethers.utils.BigNumber | null) => {
    const { pop } = useNavigation();
    const { t } = useTranslation("savings");
    const { loomChain } = useContext(ChainContext);
    const [starting, setStarting] = useState(false);
    const { update } = useAssetBalancesUpdater();
    const { load } = useMySavingsLoader();
    const start = async () => {
        if (loomChain && asset && amount) {
            setStarting(true);
            try {
                await startSavings(loomChain, asset, amount);
                await update();
                await load();
                SnackBar.success(t("aNewSavingsStartToday"));
                Sentry.track(Sentry.trackingTopics.SAVINGS_DEPOSITED);
                pop();
            } catch (e) {
                SnackBar.danger(e.message);
                Sentry.error(e);
            } finally {
                setStarting(false);
            }
        }
    };
    return { starting, start };
};

export default useSavingsStarter;
