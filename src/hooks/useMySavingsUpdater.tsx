import { useCallback, useContext, useEffect } from "react";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { ChainContext } from "../contexts/ChainContext";
import { SavingsContext } from "../contexts/SavingsContext";
import useLogLoader from "./useLogLoader";

const useMySavingsUpdater = () => {
    const { loomChain } = useContext(ChainContext);
    const { setMyRecords, asset } = useContext(SavingsContext);
    const { getSavingsLogs } = useLogLoader(asset!);

    const update = useCallback(async () => {
        if (loomChain) {
            const market = loomChain.getMoneyMarket();
            const events = await getSavingsLogs();
            const savingRecords = await market.getSavingsRecords(loomChain.getAddress().toLocalAddressString());
            savingRecords.forEach(r => {
                r.withdrawals = events.filter(e => toBigNumber(e.recordId).eq(r.id));
            });
            setMyRecords(savingRecords.filter(r => !r.balance.isZero()));
        }
    }, [loomChain, getSavingsLogs]);
    return { update };
};

export default useMySavingsUpdater;
