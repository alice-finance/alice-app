import { useContext, useEffect, useState } from "react";

import { ChainContext } from "../contexts/ChainContext";

const useEthereumBlockNumberListener = () => {
    const { ethereumChain } = useContext(ChainContext);
    const [blockNumber, setBlockNumber] = useState<number | null>(null);
    useEffect(() => {
        ethereumChain!.getProvider().on("block", setBlockNumber);
        return () => {
            ethereumChain!.getProvider().removeListener("block", setBlockNumber);
        };
    }, [ethereumChain]);
    return { blockNumber };
};

export default useEthereumBlockNumberListener;
