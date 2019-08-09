import { useCallback, useContext, useEffect, useState } from "react";

import { ChainContext } from "../contexts/ChainContext";

const useEthereumBlockNumberListener = () => {
    const { ethereumChain } = useContext(ChainContext);
    const [isActive, setActive] = useState(false);
    const [blockNumber, setBlockNumber] = useState<number | null>(null);

    const activateListener = useCallback(() => {
        if (!isActive) {
            setActive(true);
            ethereumChain!
                .getProvider()
                .getBlockNumber()
                .then(setBlockNumber);
            ethereumChain!.getProvider().on("block", setBlockNumber);
        }
    }, [ethereumChain, isActive]);

    const deactivateListener = useCallback(() => {
        if (isActive) {
            setActive(false);
            ethereumChain!.getProvider().removeListener("block", setBlockNumber);
        }
    }, [ethereumChain, isActive]);

    useEffect(() => {
        ethereumChain!
            .getProvider()
            .getBlockNumber()
            .then(setBlockNumber);
        return () => {
            if (isActive) {
                deactivateListener();
            }
        };
    }, [ethereumChain, isActive, deactivateListener]);

    return { isActive, blockNumber, activateListener, deactivateListener };
};

export default useEthereumBlockNumberListener;
