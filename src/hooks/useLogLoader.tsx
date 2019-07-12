import { useCallback, useContext } from "react";
import { AsyncStorage } from "react-native";

import { ERC20Asset } from "@alice-finance/alice.js";
import { ChainContext } from "../contexts/ChainContext";
import useKyberSwap from "./useKyberSwap";

interface LogWrapper {
    lastBlockNumber: number;
    logs: any[];
}

const getLogWrapper = async (symbol: string, type: string): Promise<LogWrapper> => {
    const key = symbol + "-logs-" + type;
    const logWrapperData = (await AsyncStorage.getItem(key)) || '{"lastBlockNumber": 0, "logs": []}';
    return JSON.parse(logWrapperData);
};

const setLogWrapper = async (symbol: string, type: string, logWrapper: LogWrapper) => {
    const key = symbol + "-logs-" + type;
    await AsyncStorage.setItem(key, JSON.stringify(logWrapper));
};

export const removeLogWrapper = async (symbol: string, type: string) => {
    const key = symbol + "-logs-" + type;
    await AsyncStorage.removeItem(key);
};

const useLogLoader = (asset: ERC20Asset) => {
    const { ethereumChain } = useContext(ChainContext);
    const { getSwapLogsAsync } = useKyberSwap();

    const getGatewayDepositLogs = useCallback(async () => {
        const TYPE = "gateway-deposit";
        const logWrapper = await getLogWrapper(asset.symbol, TYPE);

        if (ethereumChain !== null) {
            const lastBlock = logWrapper.lastBlockNumber;
            const latestBlock = await ethereumChain.getProvider().getBlockNumber();

            if (asset.ethereumAddress.isZero()) {
                const result = await ethereumChain.getETHReceivedLogsAsync(lastBlock, latestBlock);

                if (result) {
                    logWrapper.logs = [...logWrapper.logs, ...result];
                    logWrapper.lastBlockNumber = latestBlock;
                    await setLogWrapper(asset.symbol, TYPE, logWrapper);
                }

                return logWrapper.logs || [];
            } else {
                const result = await ethereumChain.getERC20ReceivedLogsAsync(asset, lastBlock, latestBlock);

                if (result) {
                    logWrapper.logs = [...logWrapper.logs, ...result];
                    logWrapper.lastBlockNumber = latestBlock;
                    await setLogWrapper(asset.symbol, TYPE, logWrapper);
                }
                return logWrapper.logs || [];
            }
        }

        return logWrapper.logs;
    }, [asset, ethereumChain]);

    const getGatewayWithdrawLogs = useCallback(async () => {
        const TYPE = "gateway-withdraw";
        const logWrapper = await getLogWrapper(asset.symbol, TYPE);

        if (ethereumChain !== null) {
            const lastBlock = logWrapper.lastBlockNumber;
            const latestBlock = await ethereumChain.getProvider().getBlockNumber();

            if (asset.ethereumAddress.isZero()) {
                const result = await ethereumChain.getETHWithdrawnLogsAsync(lastBlock, latestBlock);

                if (result) {
                    logWrapper.logs = [...logWrapper.logs, ...result];
                    logWrapper.lastBlockNumber = latestBlock;
                    await setLogWrapper(asset.symbol, TYPE, logWrapper);
                }

                return logWrapper.logs || [];
            } else {
                const result = await ethereumChain.getERC20WithdrawnLogsAsync(asset, lastBlock, latestBlock);

                if (result) {
                    logWrapper.logs = [...logWrapper.logs, ...result];
                    logWrapper.lastBlockNumber = latestBlock;
                    await setLogWrapper(asset.symbol, TYPE, logWrapper);
                }
                return logWrapper.logs || [];
            }
        }

        return logWrapper.logs;
    }, [asset, ethereumChain]);

    const getKyberSwapLogs = useCallback(async () => {
        const TYPE = "kyber-swap";
        const logWrapper = await getLogWrapper(asset.symbol, TYPE);

        if (ethereumChain !== null) {
            const lastBlock = logWrapper.lastBlockNumber;
            const latestBlock = await ethereumChain.getProvider().getBlockNumber();

            const result = await getSwapLogsAsync(asset, lastBlock, latestBlock);

            if (result) {
                logWrapper.logs = [...logWrapper.logs, ...result];
                logWrapper.lastBlockNumber = latestBlock;
                await setLogWrapper(asset.symbol, TYPE, logWrapper);
            }

            return logWrapper.logs || [];
        }

        return logWrapper.logs;
    }, [asset, ethereumChain, getSwapLogsAsync]);

    return {
        getGatewayDepositLogs,
        getGatewayWithdrawLogs,
        getKyberSwapLogs
    };
};

export default useLogLoader;
