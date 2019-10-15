import { useCallback, useContext, useState } from "react";

import { ERC20Asset } from "@alice-finance/alice.js/dist";
import { ethers } from "ethers";
import { ChainContext } from "../contexts/ChainContext";
import KyberNetworkProxy, { KyberRate } from "../contracts/KyberNetworkProxy";
import SnackBar from "../utils/SnackBar";
import useAsyncEffect from "./useAsyncEffect";

const useKyberNetworkProxy = (srcAsset: ERC20Asset, destAsset: ERC20Asset, amount: ethers.utils.BigNumber) => {
    const { ethereumChain } = useContext(ChainContext);
    const [rate, setRate] = useState<KyberRate | null>(null);
    const kyber = KyberNetworkProxy.at(ethereumChain!);
    useAsyncEffect(async () => {
        const rates = await kyber.getExpectedRate(srcAsset, destAsset, amount);
        setRate({ expectedRate: rates[0], slippageRate: rates[1] });
    }, []);
    const swapEtherToToken = useCallback(async () => {
        if (rate) {
            try {
                if (srcAsset.ethereumAddress.isZero()) {
                    return await kyber.swapEtherToToken(destAsset, rate.slippageRate, { value: amount });
                }
            } catch (e) {
                SnackBar.danger(e.message);
            }
        }
    }, [srcAsset, destAsset, rate]);
    return { rate, swapEtherToToken };
};

export default useKyberNetworkProxy;
