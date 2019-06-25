import { useCallback, useContext } from "react";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { getLogs } from "@alice-finance/alice.js/dist/utils/ethers-utils";
import { ChainContext } from "../contexts/ChainContext";
import { SavingsContext } from "../contexts/SavingsContext";

const useMySavingsUpdater = () => {
    const { loomChain } = useContext(ChainContext);
    const { setMyRecords } = useContext(SavingsContext);
    const update = useCallback(async () => {
        if (loomChain) {
            const market = loomChain.getMoneyMarket();
            const transaction = await loomChain
                .getProvider()
                .getTransaction(loomChain.config.moneyMarket.transactionHash);
            const fromBlock = Number(transaction.blockNumber || 0);
            const event = market.interface.events.SavingsWithdrawn;
            const logs = await getLogs(loomChain.getProvider(), {
                address: market.address,
                topics: [event.topic],
                fromBlock,
                toBlock: "latest"
            });
            const events = logs
                .map(log => event.decode(log.data))
                .map(data => ({
                    recordId: toBigNumber(data.recordId),
                    amount: toBigNumber(data.amount),
                    timestamp: new Date(data.timestamp.toNumber() * 1000)
                }));
            const savingRecords = await market.getSavingsRecords(loomChain.getAddress().toLocalAddressString());
            savingRecords.forEach(r => {
                r.withdrawals = events.filter(e => e.recordId.eq(r.id));
            });
            setMyRecords(savingRecords.filter(r => !r.balance.isZero()));
        }
    }, [loomChain]);
    return { update };
};

export default useMySavingsUpdater;
