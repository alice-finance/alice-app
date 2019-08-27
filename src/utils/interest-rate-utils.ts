import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { BigNumber } from "ethers/utils";

export const compoundToAPR = (interestRate: number | string | BigNumber, decimals: number) => {
    const multiplier = toBigNumber(10).pow(decimals);
    const rate = toBigNumber(interestRate).add(multiplier);
    let value = multiplier.mul(100);
    for (let i = 0; i < 365; i++) {
        value = value.mul(rate).div(multiplier);
    }
    return value.sub(multiplier.mul(100));
};
