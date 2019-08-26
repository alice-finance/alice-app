import { useCallback, useContext } from "react";

import { ChainContext } from "../contexts/ChainContext";
import Analytics from "../helpers/Analytics";
import SnackBar from "../utils/SnackBar";
import useAssetBalancesUpdater from "./useAssetBalancesUpdater";

const useDepositionRecovery = () => {
    const { ethereumChain, loomChain } = useContext(ChainContext);
    const { update } = useAssetBalancesUpdater();
    const attemptToRecover = useCallback(async () => {
        if (loomChain && ethereumChain) {
            try {
                const gateway = await loomChain.getTransferGatewayAsync();
                const ethAddress = await ethereumChain.getAddress();
                const tokens = await gateway.getUnclaimedTokensAsync(ethAddress);

                if (tokens && tokens.length > 0) {
                    await gateway.reclaimDepositorTokensAsync();
                    await update();
                }
            } catch (e) {
                SnackBar.danger(e.message);
                Analytics.track(Analytics.events.ERROR, {
                    trace: e.stack,
                    message: e.message
                });
            }
        }
    }, [loomChain, ethereumChain]);
    return { attemptToRecover };
};

export default useDepositionRecovery;
