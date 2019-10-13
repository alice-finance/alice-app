import { useContext, useEffect, useState } from "react";

import { Address } from "@alice-finance/alice.js/dist";
import { ETH_MAX_FEE } from "../constants/token";
import { AssetContext } from "../contexts/AssetContext";
import { BalancesContext } from "../contexts/BalancesContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";

const usePendingDepositChecker = () => {
    const { assets } = useContext(AssetContext);
    const { getBalance, lastUpdated } = useContext(BalancesContext);
    const { getPendingDepositAddresses } = useContext(PendingTransactionsContext);
    const [addressesWithPendingDeposit, setAddressesWithPendingDeposit] = useState<Address[]>([]);
    useEffect(() => {
        const addressesWithBalance = assets
            .filter(asset => {
                const balance = getBalance(asset.ethereumAddress);
                return asset.ethereumAddress.isZero() ? balance.gt(ETH_MAX_FEE) : !balance.isZero();
            })
            .map(asset => asset.ethereumAddress);
        const pendingAddresses = getPendingDepositAddresses();
        setAddressesWithPendingDeposit([...addressesWithBalance, ...pendingAddresses]);
    }, [lastUpdated]);
    return { addressesWithPendingDeposit };
};

export default usePendingDepositChecker;
