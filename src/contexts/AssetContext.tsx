import React, { useCallback, useState } from "react";

import Address from "@alice-finance/alice.js/dist/Address";
import { ZERO_ADDRESS } from "@alice-finance/alice.js/dist/constants";
import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { LocalAddress } from "loom-js/dist";

export const AssetContext = React.createContext({
    assets: [] as ERC20Asset[],
    getAssetByLoomAddress: (address: string) => undefined as (ERC20Asset | undefined),
    getAssetByEthereumAddress: (address: string) => undefined as (ERC20Asset | undefined),
    setAssets: (tokens: ERC20Asset[]) => {}
});

export const AssetProvider = ({ children }) => {
    const [assets, setAssets] = useState([] as ERC20Asset[]);
    const getAssetByLoomAddress = useCallback(
        (address: string) =>
            assets.find((value: ERC20Asset) => value.loomAddress.local.equals(LocalAddress.fromHexString(address))),
        [assets]
    );
    const getAssetByEthereumAddress = useCallback(
        (address: string) =>
            assets.find((value: ERC20Asset) => value.ethereumAddress.local.equals(LocalAddress.fromHexString(address))),
        [assets]
    );
    return (
        <AssetContext.Provider
            value={{
                assets: [ETH_COIN, ...assets],
                getAssetByLoomAddress,
                getAssetByEthereumAddress,
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
