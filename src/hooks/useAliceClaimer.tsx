import { useCallback, useContext, useEffect, useState } from "react";

import { LoomChain } from "@alice-finance/alice.js/dist";
import { ZERO_ADDRESS } from "@alice-finance/alice.js/dist/constants";
import { SavingsRecord } from "@alice-finance/alice.js/dist/contracts/MoneyMarket";
import { ethers } from "ethers";
import { BigNumber } from "ethers/utils";
import { ChainContext } from "../contexts/ChainContext";
import useAsyncEffect from "./useAsyncEffect";
import useTokenBalanceUpdater from "./useTokenBalanceUpdater";

class AliceIFO extends ethers.Contract {
    constructor(loomChain: LoomChain, address: string) {
        super(
            // require("@alice-finance/token/networks/AliceIFO.json")[loomChain!.config.chainId].address,
            address,
            require("@alice-finance/token/abis/AliceIFO.json"),
            loomChain!.getSigner()
        );
    }
}

// tslint:disable-next-line:max-classes-per-file
class AliceFund extends ethers.Contract {
    constructor(loomChain: LoomChain) {
        super(
            require("@alice-finance/token/networks/AliceFund.json")[loomChain!.config.chainId].address,
            require("@alice-finance/token/abis/AliceFund.json"),
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
    const [ifo, setIfo] = useState<AliceIFO | null>(null);
    const fund = new AliceFund(loomChain!);
    useEffect(() => {
        fund.ifo().then(address => (address === ZERO_ADDRESS ? null : setIfo(new AliceIFO(loomChain!, address))));
    }, []);
    const refresh = async () => {
        if (ifo) {
            setClaimableAmount(await ifo.getClaimableAmount(record.id));
            let timestamp = await ifo.getLastClaimTimestamp(record.id);
            timestamp = timestamp.isZero() ? record.initialTimestamp.getTime() : timestamp.toNumber() * 1000;
            const interval = await ifo.getInterval();
            setClaimableAt(new Date(timestamp + interval * 1000));
        }
    };
    const claim = useCallback(async () => {
        try {
            if (ifo) {
                setClaiming(true);
                await ifo.claim(record.id, { gasLimit: 0 });
                setClaimableAt(null);
                refresh().then(update);
            }
        } catch (e) {
            throw e;
        } finally {
            setClaiming(false);
        }
    }, [record, ifo]);
    useAsyncEffect(refresh, [record, ifo]);
    return { claimableAt, claimableAmount, claim, claiming, ifo };
};
export default useAliceClaimer;
