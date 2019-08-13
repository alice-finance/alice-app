import { useContext, useEffect, useState } from "react";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway";
import { ChainContext } from "../contexts/ChainContext";
import useEthereumBlockNumberListener from "./useEthereumBlockNumberListener";

const usePendingWithdrawalListener = (asset: ERC20Asset | null) => {
    const { loomChain, ethereumChain } = useContext(ChainContext);
    const { blockNumber, activateListener, deactivateListener } = useEthereumBlockNumberListener();
    const [receipt, setReceipt] = useState<IWithdrawalReceipt | null>();
    useEffect(() => {
        activateListener();
        return () => {
            deactivateListener();
        };
    }, []);
    useEffect(() => {
        const refresh = async () => {
            const ethereumNonce = await ethereumChain!.getWithdrawalNonceAsync();
            if (asset != null) {
                if (asset.ethereumAddress.isZero()) {
                    setReceipt(await loomChain!.getPendingETHWithdrawalReceipt(ethereumNonce));
                } else {
                    const r = await loomChain!.getPendingERC20WithdrawalReceipt(ethereumNonce);
                    if (r && r.tokenContract.equals(asset.ethereumAddress)) {
                        setReceipt(r);
                    } else {
                        setReceipt(null);
                    }
                }
            } else {
                const ethReceipt = await loomChain!.getPendingETHWithdrawalReceipt(ethereumNonce);
                if (ethReceipt) {
                    setReceipt(ethReceipt);
                } else {
                    const ercReceipt = await loomChain!.getPendingERC20WithdrawalReceipt(ethereumNonce);
                    if (ercReceipt) {
                        setReceipt(ercReceipt);
                    } else {
                        setReceipt(null);
                    }
                }
            }
        };
        refresh();
    }, [asset, blockNumber]);
    return { receipt, setReceipt };
};

export default usePendingWithdrawalListener;
