import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { ethers } from "ethers";
import { fromWei } from "web3-utils";
import { ERC20_MAX_PRECISION } from "../constants/token";

export const pow10 = (e: number) => toBigNumber(10).pow(e);

export const formatValue = (
    value: string | ethers.utils.BigNumber,
    decimals: number = ERC20_MAX_PRECISION,
    precision: number = ERC20_MAX_PRECISION,
    useCommas: boolean = false
) => {
    const formatted = fromWei(
        toBigNumber(value)
            .mul(pow10(18 - decimals))
            .toString(),
        "ether"
    );

    const numberSeparator = ",";
    const decimalPoint = ".";

    let [intPart, realPart] = formatted.split(".");

    if (intPart === undefined) {
        intPart = "0";
    }

    if (realPart === undefined) {
        realPart = "";
    }

    if (useCommas) {
        const reg = /(^[+-]?\d+)(\d{3})/;
        while (reg.test(intPart)) {
            intPart = intPart.replace(reg, "$1" + numberSeparator + "$2");
        }
    }

    if (precision > 0) {
        if (realPart && realPart.length > precision) {
            realPart = realPart.substring(0, precision);
        } else {
            do {
                realPart = "0" + realPart;
            } while (realPart.length < precision);
        }

        return [intPart, realPart].join(decimalPoint);
    } else {
        return intPart;
    }
};

export const parseValue = (value: string, decimals: number) => {
    const index = value.indexOf(".");
    const d = value.length - index - 1;
    value = value.replace(".", "");
    if (index >= 0) {
        if (value.length - index > decimals) {
            throw new Error("decimals are greater than " + decimals);
        }
        for (let i = 0; i < decimals - d; i++) {
            value += "0";
        }
    } else {
        for (let i = 0; i < decimals; i++) {
            value += "0";
        }
    }
    return toBigNumber(value);
};

export const filterPrecision = (value: string) => {
    const index = value.indexOf(".");
    const precision = index >= 0 ? value.length - index - 1 : 0;
    return precision <= ERC20_MAX_PRECISION ? value : value.substring(0, index + ERC20_MAX_PRECISION + 1);
};
