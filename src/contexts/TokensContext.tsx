import React, { useState } from "react";

import ERC20Token from "../evm/ERC20Token";

export const TokensContext = React.createContext({
    tokens: {} as [ERC20Token],
    setTokens: (tokens: [ERC20Token]) => {}
});

export const TokensProvider = ({ children }) => {
    const [tokens, setTokens] = useState({} as [ERC20Token]);
    return (
        <TokensContext.Provider
            value={{
                tokens,
                setTokens
            }}>
            {children}
        </TokensContext.Provider>
    );
};

export const TokensConsumer = TokensContext.Consumer;
