import { useCallback, useContext, useState } from "react";

import { LoomChain } from "@alice-finance/alice.js/dist";
import { SavingsRecord } from "@alice-finance/alice.js/dist/contracts/MoneyMarket";
import { ethers } from "ethers";
import { BigNumber } from "ethers/utils";
import { ChainContext } from "../contexts/ChainContext";
import useAsyncEffect from "./useAsyncEffect";
import useTokenBalanceUpdater from "./useTokenBalanceUpdater";

class AliceIFO extends ethers.Contract {
    constructor(loomChain: LoomChain) {
        super(
            require("@alice-finance/token/networks/AliceIFO.json")[loomChain!.config.chainId].address,
            require("@alice-finance/token/abis/AliceIFO.json"),
            loomChain!.getSigner()
        );
    }
}

const useAliceClaimer = (record: SavingsRecord) => {
    const { loomChain } = useContext(ChainContext);
    const { update } = useTokenBalanceUpdater();
    const [claimableAt, setClaimableAt] = useState<Date | null>(null);
    const [claimableAmount, setClaimableAmount] = useState<BigNumber | null>(null);
    const [claiming, setClaiming] = useState(false);
    const ifo = new AliceIFO(loomChain!);
    const refresh = async () => {
        setClaimableAmount(await ifo.getClaimableAmount(record.id));
        let timestamp = await ifo.getLastClaimTimestamp(record.id);
        timestamp = timestamp.isZero() ? record.initialTimestamp.getTime() : timestamp.toNumber() * 1000;
        const interval = await ifo.getInterval();
        setClaimableAt(new Date(timestamp + interval * 1000));
    };
    const claim = useCallback(async () => {
        try {
            setClaiming(true);
            await ifo.claim(record.id, { gasLimit: 0 });
            refresh().then(update);
        } catch (e) {
            throw e;
        } finally {
            setClaiming(false);
        }
    }, [record]);
    useAsyncEffect(refresh, [record]);
    return { claimableAt, claimableAmount, claim, claiming };
};
export default useAliceClaimer;
