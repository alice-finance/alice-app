import React, { useCallback, useState } from "react";
import { ETHEREUM_CHAIN_ID, LOOM_CHAIN_ID } from "react-native-dotenv";

import { LocalAddress } from "loom-js/dist";
import { NULL_ADDRESS } from "../constants/token";
import Address from "../evm/Address";
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
                tokens: [ETH_COIN, ...tokens],
                getTokenByLoomAddress,
                getTokenByEthereumAddress,
                setTokens
            }}>
            {children}
        </TokensContext.Provider>
    );
};

const ETH_COIN = new ERC20Token(
    "Ethereum",
    "ETH",
    18,
    Address.fromString(ETHEREUM_CHAIN_ID + ":" + NULL_ADDRESS),
    Address.fromString(LOOM_CHAIN_ID + ":" + NULL_ADDRESS)
);

export const TokensConsumer = TokensContext.Consumer;
