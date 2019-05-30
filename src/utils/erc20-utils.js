import { ERC20_MAX_PRECISION } from "../constants/token";
import utils, { fromWei } from "web3-utils";

export const toBN = utils.toBN;

export const pow10 = e => toBN(10).pow(toBN(e));

export const isZero = value => toBN(value).toString() === "0";

export const formatValue = (value, decimals, precision = ERC20_MAX_PRECISION) => {
    let formatted = fromWei(
        toBN(value)
            .mul(pow10(18 - decimals))
            .toString(10),
        "ether"
    );
    if (precision && precision > 0) {
        const index = formatted.indexOf(".");
        if (index > 0) {
            if (formatted.length < index + precision + 1) {
                const padding = index + precision + 1 - formatted.length;
                for (let i = 0; i < padding; i++) { formatted += "0"; }
            } else {
                formatted = formatted.substring(0, index + precision + 1);
            }
        } else {
            formatted += ".";
            for (let i = 0; i < precision; i++) { formatted += "0"; }
        }
    }
    return formatted;
};

export const parseValue = (value, decimals) => {
    const index = value.indexOf(".");
    const d = value.length - index - 1;
    value = value.replace(".", "");
    if (index >= 0) {
        if (value.length - index > decimals) {
            throw new Error("decimals are greater than " + decimals);
        }
        for (let i = 0; i < decimals - d; i++) { value += "0"; }
    } else {
        for (let i = 0; i < decimals; i++) { value += "0"; }
    }
    return toBN(value);
};

export const filterPrecision = value => {
    const index = value.indexOf(".");
    const precision = index >= 0 ? value.length - index - 1 : 0;
    return precision <= ERC20_MAX_PRECISION ? value : value.substring(0, index + ERC20_MAX_PRECISION + 1);
};
