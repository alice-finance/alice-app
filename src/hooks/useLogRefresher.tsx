import { useCallback, useEffect, useState } from "react";

import {
    ERC20Received,
    ERC20Withdrawn,
    ETHReceived,
    ETHWithdrawn
} from "@alice-finance/alice.js/dist/chains/EthereumChain";
import { TokenSwapped } from "./useKyberSwap";
import useLogLoader from "./useLogLoader";

const useLogRefresher = asset => {
    const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
    const [swapped, setSwapped] = useState<TokenSwapped[]>();
    const [received, setReceived] = useState<ETHReceived[] | ERC20Received[]>();
    const [withdrawn, setWithdrawn] = useState<ETHWithdrawn[] | ERC20Withdrawn[]>();
    const [items, setItems] = useState<
        Array<ETHReceived | ERC20Received | ETHWithdrawn | ERC20Withdrawn | TokenSwapped>
    >();
    const { getGatewayDepositLogs, getGatewayWithdrawLogs, getKyberSwapLogs } = useLogLoader(asset);
    const refreshLogs = useCallback(async () => {
        if (!isRefreshingLogs) {
            setIsRefreshingLogs(true);
            await Promise.all([
                getGatewayDepositLogs().then(setReceived),
                getGatewayWithdrawLogs().then(setWithdrawn),
                getKyberSwapLogs().then(setSwapped)
            ]);
            setIsRefreshingLogs(false);
        }
    }, [asset, isRefreshingLogs, setIsRefreshingLogs, getGatewayDepositLogs, getGatewayWithdrawLogs, getKyberSwapLogs]);
    useEffect(() => {
        if (received && withdrawn && swapped) {
            const newItems = [...(received || []), ...(withdrawn || []), ...(swapped || [])].sort(
                (l1, l2) => (l2.log.blockNumber || 0) - (l1.log.blockNumber || 0)
            );
            setItems(newItems);
        }
    }, [received, withdrawn, swapped]);
    return { items, refreshLogs };
};

export default useLogRefresher;
