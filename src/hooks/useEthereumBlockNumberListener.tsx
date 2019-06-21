import { useContext, useEffect, useState } from "react";

import { ConnectorContext } from "../contexts/ConnectorContext";

const useEthereumBlockNumberListener = () => {
    const { ethereumConnector } = useContext(ConnectorContext);
    const [blockNumber, setBlockNumber] = useState<number | null>(null);
    useEffect(() => {
        ethereumConnector!.provider.on("block", setBlockNumber);
        return () => {
            ethereumConnector!.provider.removeListener("block", setBlockNumber);
        };
    }, [ethereumConnector]);
    return { blockNumber };
};

export default useEthereumBlockNumberListener;
