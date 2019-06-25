import { useCallback, useContext } from "react";

import { getLogs } from "@alice-finance/alice.js/dist/utils/ethers-utils";
import { ChainContext } from "../contexts/ChainContext";
import { SavingsContext } from "../contexts/SavingsContext";

const useMySavingsUpdater = () => {
    const { loomChain } = useContext(ChainContext);
    const { setMyRecords } = useContext(SavingsContext);
    const update = useCallback(async () => {
        if (loomChain) {
            const market = loomChain.createMoneyMarket();
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
                    recordId: data.recordId,
                    amount: data.amount,
                    timestamp: new Date(data.timestamp.toNumber() * 1000)
                }));
            const savingRecords = await market.getSavingsRecords(loomChain.getAddress().toLocalAddressString());
            const myRecords = savingRecords
                .map(record => ({
                    id: record[0],
                    interestRate: record[2],
                    balance: record[3],
                    principal: record[4],
                    initialTimestamp: new Date(record[5].toNumber() * 1000),
                    lastTimestamp: new Date(record[6].toNumber() * 1000),
                    withdrawals: events.filter(e => e.recordId.eq(record[0]))
                }))
                .filter(r => !r.balance.isZero());
            setMyRecords(myRecords);
        }
    }, [loomChain]);
    return { update };
};

export default useMySavingsUpdater;
