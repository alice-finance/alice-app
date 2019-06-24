import { useCallback, useContext, useState } from "react";

import { AssetContext } from "../contexts/AssetContext";
import { BalancesContext } from "../contexts/BalancesContext";
import { ChainContext } from "../contexts/ChainContext";

const useTokenBalanceUpdater = () => {
    const { assets } = useContext(AssetContext);
    const { updateBalance } = useContext(BalancesContext);
    const { ethereumChain, loomChain } = useContext(ChainContext);
    const [updating, setUpdating] = useState(true);
    const update = useCallback(async () => {
        try {
            if (ethereumChain && loomChain) {
                await Promise.all([
                    ethereumChain.updateAssetBalancesAsync(assets, updateBalance),
                    loomChain.updateAssetBalancesAsync(assets, updateBalance)
                ]);
            }
            setUpdating(false);
        } catch (e) {
            setUpdating(false);
        }
    }, [assets, ethereumChain, loomChain]);
    return { updating, update };
};

export default useTokenBalanceUpdater;
