import { useCallback, useContext } from "react";
import { AsyncStorage } from "react-native";

import { ERC20Asset } from "@alice-finance/alice.js";
import { ChainContext } from "../contexts/ChainContext";
import useKyberSwap from "./useKyberSwap";

interface LogWrapper {
    lastBlockNumber: number;
    logs: any[];
}

interface LogObject {
    log: {
        transactionHash: string;
    };
}

const removeDuplicate = (list: any[]) => {
    const hashSet = Array.from(new Set(list.map((a: LogObject) => a.log.transactionHash)));
    const result = hashSet.map(hash => list.find((a: LogObject) => a.log.transactionHash === hash));
    return result;
};

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
                if (lastBlock < latestBlock) {
                    const result = await ethereumChain.getETHReceivedLogsAsync(lastBlock, latestBlock);

                    if (result) {
                        logWrapper.logs = removeDuplicate([...logWrapper.logs, ...result]);
                        logWrapper.lastBlockNumber = latestBlock;
                        await setLogWrapper(asset.symbol, TYPE, logWrapper);
                    }
                }

                return logWrapper.logs || [];
            } else {
                if (lastBlock < latestBlock) {
                    const result = await ethereumChain.getERC20ReceivedLogsAsync(asset, lastBlock, latestBlock);

                    if (result) {
                        logWrapper.logs = removeDuplicate([...logWrapper.logs, ...result]);
                        logWrapper.lastBlockNumber = latestBlock;
                        await setLogWrapper(asset.symbol, TYPE, logWrapper);
                    }
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
                if (lastBlock < latestBlock) {
                    const result = await ethereumChain.getETHWithdrawnLogsAsync(lastBlock, latestBlock);

                    if (result) {
                        logWrapper.logs = removeDuplicate([...logWrapper.logs, ...result]);
                        logWrapper.lastBlockNumber = latestBlock;
                        await setLogWrapper(asset.symbol, TYPE, logWrapper);
                    }
                }

                return logWrapper.logs || [];
            } else {
                if (lastBlock < latestBlock) {
                    const result = await ethereumChain.getERC20WithdrawnLogsAsync(asset, lastBlock, latestBlock);

                    if (result) {
                        logWrapper.logs = removeDuplicate([...logWrapper.logs, ...result]);
                        logWrapper.lastBlockNumber = latestBlock;
                        await setLogWrapper(asset.symbol, TYPE, logWrapper);
                    }
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

            if (lastBlock < latestBlock) {
                const result = await getSwapLogsAsync(asset, lastBlock, latestBlock);

                if (result) {
                    logWrapper.logs = removeDuplicate([...logWrapper.logs, ...result]);
                    logWrapper.lastBlockNumber = latestBlock;
                    await setLogWrapper(asset.symbol, TYPE, logWrapper);
                }
            }

            return logWrapper.logs || [];
        }

        return logWrapper.logs;
    }, [asset, ethereumChain, getSwapLogsAsync]);

    const getCached = useCallback(async () => {
        const depositLogWrapper = await getLogWrapper(asset.symbol, "gateway-deposit");
        const withdrawLogWrapper = await getLogWrapper(asset.symbol, "gateway-withdraw");
        const swapLogWrapper = await getLogWrapper(asset.symbol, "kyber-swap");

        return [
            ...(depositLogWrapper.logs || []),
            ...(withdrawLogWrapper.logs || []),
            ...(swapLogWrapper.logs || [])
        ].sort((l1, l2) => (l2.log.blockNumber || 0) - (l1.log.blockNumber || 0));
    }, []);

    return {
        getGatewayDepositLogs,
        getGatewayWithdrawLogs,
        getKyberSwapLogs,
        getCached
    };
};

export default useLogLoader;
