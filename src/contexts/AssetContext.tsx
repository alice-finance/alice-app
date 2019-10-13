import React, { useCallback, useState } from "react";

import Address from "@alice-finance/alice.js/dist/Address";
import { ZERO_ADDRESS } from "@alice-finance/alice.js/dist/constants";
import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";

export const AssetContext = React.createContext({
    assets: [] as ERC20Asset[],
    getAssetByAddress: (address: Address) => null as (ERC20Asset | null),
    getAssetBySymbol: (symbol: string) => null as (ERC20Asset | null),
    setAssets: (tokens: ERC20Asset[]) => {}
});

export const AssetProvider = ({ children }) => {
    const [assets, setAssets] = useState([] as ERC20Asset[]);
    const getAssetByAddress = useCallback(
        (address: Address) =>
            address.isZero()
                ? ETH_COIN
                : assets.find((asset: ERC20Asset) => asset.loomAddress.equals(address)) ||
                  assets.find((asset: ERC20Asset) => asset.ethereumAddress.equals(address)) ||
                  null,
        [assets]
    );
    const getAssetBySymbol = useCallback(
        (symbol: string) => assets.find((asset: ERC20Asset) => asset.symbol === symbol) || null,
        [assets]
    );
    return (
        <AssetContext.Provider
            value={{
                assets: [ETH_COIN, ...assets],
                getAssetByAddress,
                getAssetBySymbol,
                setAssets
            }}>
            {children}
        </AssetContext.Provider>
    );
};

const ETH_COIN = new ERC20Asset(
    "Ethereum",
    "ETH",
    18,
    Address.createLoomAddress(ZERO_ADDRESS),
    Address.createEthereumAddress(ZERO_ADDRESS)
);

export const AssetConsumer = AssetContext.Consumer;
