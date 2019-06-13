import { useContext } from "react";

import { ConnectorContext } from "../contexts/ConnectorContext";
import { SavingsContext } from "../contexts/SavingsContext";

const useMySavingsUpdater = () => {
    const { loomConnector } = useContext(ConnectorContext);
    const { setMyRecords } = useContext(SavingsContext);
    const update = async () => {
        const market = loomConnector!.getMoneyMarket();
        const savingRecords = await market.getSavingsRecords(loomConnector!.address.toLocalAddressString());
        setMyRecords(
            savingRecords.map(record => ({
                id: record[0],
                interestRate: record[2],
                balance: record[3],
                principal: record[4],
                initialTimestamp: new Date(record[5].toNumber() * 1000),
                lastTimestamp: new Date(record[6].toNumber() * 1000)
            }))
        );
    };
    return { update };
};

export default useMySavingsUpdater;
