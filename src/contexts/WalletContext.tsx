import React, { useState } from "react";

import EthereumWallet from "../evm/EthereumWallet";
import LoomWallet from "../evm/LoomWallet";

export const WalletContext = React.createContext({
    mnemonic: "",
    setMnemonic: mnemonic => {},
    loomWallet: null as (LoomWallet | null),
    setLoomWallet: (wallet: LoomWallet) => {},
    ethereumWallet: null as (EthereumWallet | null),
    setEthereumWallet: (wallet: EthereumWallet) => {}
});

export const WalletProvider = ({ children }) => {
    const [mnemonic, setMnemonic] = useState("");
    const [loomWallet, setLoomWallet] = useState<LoomWallet | null>(null);
    const [ethereumWallet, setEthereumWallet] = useState<EthereumWallet | null>(null);
    return (
        <WalletContext.Provider
            value={{ mnemonic, setMnemonic, loomWallet, setLoomWallet, ethereumWallet, setEthereumWallet }}>
            {children}
        </WalletContext.Provider>
    );
};

export const WalletConsumer = WalletContext.Consumer;
