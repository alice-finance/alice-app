import React, { useCallback, useState } from "react";

import { LocalAddress } from "loom-js/dist";
import ERC20Token from "../evm/ERC20Token";

export const TokensContext = React.createContext({
    tokens: [] as ERC20Token[],
    getTokenByLoomAddress: (address: string) => undefined as (ERC20Token | undefined),
    getTokenByEthereumAddress: (address: string) => undefined as (ERC20Token | undefined),
    setTokens: (tokens: ERC20Token[]) => {}
});

export const TokensProvider = ({ children }) => {
    const [tokens, setTokens] = useState([] as ERC20Token[]);
    const getTokenByLoomAddress = useCallback(
        (address: string) =>
            tokens.find((value: ERC20Token) => value.loomAddress.local.equals(LocalAddress.fromHexString(address))),
        [tokens]
    );
    const getTokenByEthereumAddress = useCallback(
        (address: string) =>
            tokens.find((value: ERC20Token) => value.ethereumAddress.local.equals(LocalAddress.fromHexString(address))),
        [tokens]
    );
    return (
        <TokensContext.Provider
            value={{
                tokens,
                getTokenByLoomAddress,
                getTokenByEthereumAddress,
                setTokens
            }}>
            {children}
        </TokensContext.Provider>
    );
};

export const TokensConsumer = TokensContext.Consumer;
