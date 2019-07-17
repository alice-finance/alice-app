import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";

const GAS_DEFAULT = toBigNumber("10000000000"); // 10 GWEI

export const getGasPrice = async () => {
    try {
        const response = await fetch("https://ethgasstation.info/json/ethgasAPI.json");
        const responseJson = await response.json();

        // check if `fast` is 1 minute faster than `avg`
        if (responseJson.avgWait - responseJson.fastWait > 1.0) {
            // To convert the provided values to wei, multiply by 100000000
            return toBigNumber(responseJson.fast * 100000000);
        } else {
            return toBigNumber(responseJson.avg * 100000000);
        }
    } catch {
        return GAS_DEFAULT;
    }
};
