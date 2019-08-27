import { useCallback, useContext } from "react";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { ChainContext } from "../contexts/ChainContext";
import { SavingsContext } from "../contexts/SavingsContext";
import { fetchCollection } from "../utils/firebase-utils";

const useMySavingsLoader = () => {
    const { loomChain } = useContext(ChainContext);
    const { setMyRecords } = useContext(SavingsContext);
    const load = useCallback(async () => {
        if (loomChain) {
            const market = loomChain.getMoneyMarket();
            const savingRecords = await market.getSavingsRecords(loomChain.getAddress().toLocalAddressString());
            const myAddress = loomChain.getAddress().toLocalAddressString();
            const withdrawals = await fetchCollection(ref =>
                ref
                    .doc("events")
                    .collection("SavingsWithdrawn")
                    .where("owner", "==", myAddress.toLowerCase())
                    .orderBy("timestamp", "desc")
            );
            const savingsWithdrawals = withdrawals.map(withdrawal => ({
                recordId: toBigNumber(withdrawal.recordId),
                amount: toBigNumber(withdrawal.amount),
                timestamp: new Date(withdrawal.timestamp * 1000)
            }));
            savingRecords.forEach(r => {
                r.withdrawals = savingsWithdrawals.filter(e => e.recordId.eq(r.id));
            });
            setMyRecords(savingRecords.filter(r => !r.balance.isZero()));
        }
    }, [loomChain]);
    return { load };
};

export default useMySavingsLoader;
