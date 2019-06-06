import React, { useState } from "react";

import EthereumConnector from "../evm/EthereumConnector";
import LoomConnector from "../evm/LoomConnector";

export const ConnectorContext = React.createContext({
    mnemonic: "",
    setMnemonic: mnemonic => {},
    loomConnector: null as (LoomConnector | null),
    setLoomConnector: (connector: LoomConnector) => {},
    ethereumConnector: null as (EthereumConnector | null),
    setEthereumConnector: (connector: EthereumConnector) => {}
});

export const ConnectorProvider = ({ children }) => {
    const [mnemonic, setMnemonic] = useState("");
    const [loomConnector, setLoomConnector] = useState<LoomConnector | null>(null);
    const [ethereumConnector, setEthereumConnector] = useState<EthereumConnector | null>(null);
    return (
        <ConnectorContext.Provider
            value={{ mnemonic, setMnemonic, loomConnector, setLoomConnector, ethereumConnector, setEthereumConnector }}>
            {children}
        </ConnectorContext.Provider>
    );
};

export const ConnectorConsumer = ConnectorContext.Consumer;
