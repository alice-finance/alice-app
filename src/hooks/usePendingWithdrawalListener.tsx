import { useContext, useEffect, useState } from "react";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway";
import { ChainContext } from "../contexts/ChainContext";
import useEthereumBlockNumberListener from "./useEthereumBlockNumberListener";

const usePendingWithdrawalListener = (asset: ERC20Asset) => {
    const { loomChain, ethereumChain } = useContext(ChainContext);
    const { blockNumber } = useEthereumBlockNumberListener();
    const [receipt, setReceipt] = useState<IWithdrawalReceipt | null>();
    useEffect(() => {
        const refresh = async () => {
            const ethereumNonce = await ethereumChain!.getWithdrawalNonceAsync();
            if (asset.ethereumAddress.isZero()) {
                setReceipt(await loomChain!.getPendingETHWithdrawalReceipt(ethereumNonce));
            } else {
                const r = await loomChain!.getPendingERC20WithdrawalReceipt(ethereumNonce);
                if (r && r.tokenContract.equals(asset.ethereumAddress)) {
                    setReceipt(r);
                }
            }
        };
        refresh();
    }, [blockNumber]);
    return { receipt };
};

export default usePendingWithdrawalListener;
