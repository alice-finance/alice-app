import React, { useState } from "react";

import EthereumChain from "@alice-finance/alice.js/dist/chains/EthereumChain";
import LoomChain from "@alice-finance/alice.js/dist/chains/LoomChain";

export const ChainContext = React.createContext({
    mnemonic: "",
    setMnemonic: mnemonic => {},
    loomChain: null as (LoomChain | null),
    setLoomChain: (connector: LoomChain) => {},
    ethereumChain: null as (EthereumChain | null),
    setEthereumChain: (connector: EthereumChain) => {}
});

export const ChainProvider = ({ children }) => {
    const [mnemonic, setMnemonic] = useState("");
    const [loomChain, setLoomChain] = useState<LoomChain | null>(null);
    const [ethereumChain, setEthereumChain] = useState<EthereumChain | null>(null);
    return (
        <ChainContext.Provider
            value={{
                mnemonic,
                setMnemonic,
                loomChain,
                setLoomChain,
                ethereumChain,
                setEthereumChain
            }}>
            {children}
        </ChainContext.Provider>
    );
};

export const ChainConsumer = ChainContext.Consumer;
