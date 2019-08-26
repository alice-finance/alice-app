import { useCallback, useContext } from "react";

import { ChainContext } from "../contexts/ChainContext";
import Sentry from "../utils/Sentry";
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
                Sentry.error(e);
            }
        }
    }, [loomChain, ethereumChain]);
    return { attemptToRecover };
};

export default useDepositionRecovery;
