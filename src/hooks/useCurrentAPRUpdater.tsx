import { useContext } from "react";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { ChainContext } from "../contexts/ChainContext";
import { SavingsContext } from "../contexts/SavingsContext";
import useAsyncEffect from "./useAsyncEffect";

const useCurrentAPRUpdater = () => {
    const { loomChain } = useContext(ChainContext);
    const { setAPR } = useContext(SavingsContext);
    useAsyncEffect(async () => {
        const market = loomChain!.getMoneyMarket();
        setAPR(toBigNumber(await market.getCurrentSavingsAPR()).mul(toBigNumber(100)));
    }, []);
};

export default useCurrentAPRUpdater;
