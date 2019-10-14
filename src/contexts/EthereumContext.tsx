import React from "react";

import usePersistentState from "../hooks/usePersistentState";

export const EthereumContext = React.createContext({
    currentBlockNumber: 0,
    setCurrentBlockNumber: (blockNumber: number) => {}
});

export const EthereumProvider = ({ children }) => {
    const [currentBlockNumber, setCurrentBlockNumber] = usePersistentState("currentBlockNumber", 0);
    return (
        <EthereumContext.Provider value={{ currentBlockNumber, setCurrentBlockNumber }}>
            {children}
        </EthereumContext.Provider>
    );
};

export const EthereumConsumer = EthereumContext.Consumer;
