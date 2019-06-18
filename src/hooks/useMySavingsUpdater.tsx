import { useContext } from "react";
import { LOOM_FIRST_BLOCK } from "react-native-dotenv";

import { ConnectorContext } from "../contexts/ConnectorContext";
import { SavingsContext } from "../contexts/SavingsContext";
import { getLogs } from "../utils/ethers-utils";

const useMySavingsUpdater = () => {
    const { loomConnector } = useContext(ConnectorContext);
    const { setMyRecords } = useContext(SavingsContext);
    const update = async () => {
        const market = loomConnector!.getMoneyMarket();
        const event = market.interface.events.SavingsWithdrawn;
        const logs = await getLogs(loomConnector!.provider, {
            address: market.address,
            topics: [event.topic],
            fromBlock: Number(LOOM_FIRST_BLOCK),
            toBlock: "latest"
        });
        const events = logs
            .map(log => event.decode(log.data))
            .map(data => ({
                recordId: data.recordId,
                amount: data.amount,
                timestamp: new Date(data.timestamp.toNumber() * 1000)
            }));
        const savingRecords = await market.getSavingsRecords(loomConnector!.address.toLocalAddressString());
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
    };
    return { update };
};

export default useMySavingsUpdater;
