import { useCallback, useContext } from "react";
import { AsyncStorage } from "react-native";

import { ERC20Asset } from "@alice-finance/alice.js";
import { getLogs } from "@alice-finance/alice.js/dist/utils/ethers-utils";
import { ethers } from "ethers";
import { Log } from "ethers/providers";
import { ChainContext } from "../contexts/ChainContext";
import useKyberSwap from "./useKyberSwap";

interface LogWrapper {
    lastBlockNumber: number;
    logs: any[];
    migration: number;
}

interface LogObject {
    log: {
        transactionHash: string;
    };
}

const removeDuplicate = (list: any[]) => {
    const hashSet = Array.from(new Set(list.map((a: LogObject) => a.log.transactionHash)));
    return hashSet.map(hash => list.find((a: LogObject) => a.log.transactionHash === hash));
};

const getLogWrapper = async (symbol: string, type: string): Promise<LogWrapper> => {
    const key = symbol + "-logs-" + type + (__DEV__ ? "-dev" : "");
    const logWrapperData = (await AsyncStorage.getItem(key)) || '{"lastBlockNumber": 0, "logs": [], "migration": 0}';
    return JSON.parse(logWrapperData);
};

const setLogWrapper = async (symbol: string, type: string, logWrapper: LogWrapper) => {
    const key = symbol + "-logs-" + type + (__DEV__ ? "-dev" : "");
    await AsyncStorage.setItem(key, JSON.stringify(logWrapper));
};

export const removeLogWrapper = async (symbol: string, type: string) => {
    const key = symbol + "-logs-" + type + (__DEV__ ? "-dev" : "");
    await AsyncStorage.removeItem(key);
};

const getSavingsLogsAsync = async (loomChain, address, event, lastBlock, latestBlock) => {
    let fromBlock = lastBlock;
    let toBlock = latestBlock;

    const promises: Array<Promise<Log[]>> = [];
    const userAddress = loomChain
        .getAddress()
        .toLocalAddressString()
        .toLowerCase();

    while (fromBlock < latestBlock) {
        if (latestBlock - lastBlock > 9999) {
            toBlock = fromBlock + 9999;
        }

        if (toBlock > latestBlock) {
            toBlock = latestBlock;
        }

        const pr = getLogs(loomChain.getProvider(), {
            address,
            topics: [event.topic, ethers.utils.hexZeroPad(userAddress, 32)],
            fromBlock,
            toBlock
        });

        fromBlock = toBlock + 1;

        promises.push(pr);
    }

    const result = await Promise.all(promises);
    return result.reduce((p, logs) => {
        const newLogs = logs
            .sort((l1, l2) => (l2.blockNumber || 0) - (l1.blockNumber || 0))
            .map(log => ({
                log,
                ...event.decode(log.data)
            }));
        return [...p, ...newLogs];
    });
};

const useLogLoader = (asset: ERC20Asset) => {
    const { ethereumChain, loomChain } = useContext(ChainContext);
    const { getSwapLogsAsync } = useKyberSwap();

    const getGatewayDepositLogs = useCallback(async () => {
        const TYPE = "gateway-deposit";
        const logWrapper = await getLogWrapper(asset.symbol, TYPE);

        if (ethereumChain !== null) {
            let lastBlock = logWrapper.lastBlockNumber;
            if (!("migration" in logWrapper) || logWrapper.migration === 0) {
                lastBlock = 0;
                logWrapper.migration = 1;
                logWrapper.logs = [];
            }
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
            let lastBlock = logWrapper.lastBlockNumber;
            if (!("migration" in logWrapper) || logWrapper.migration === 0) {
                lastBlock = 0;
                logWrapper.migration = 1;
                logWrapper.logs = [];
            }
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
            let lastBlock = logWrapper.lastBlockNumber;
            if (!("migration" in logWrapper) || logWrapper.migration === 0) {
                lastBlock = 0;
                logWrapper.migration = 1;
                logWrapper.logs = [];
            }
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

    const getSavingsLogs = useCallback(async () => {
        const TYPE = "savings-record";
        const logWrapper = await getLogWrapper(asset.symbol, TYPE);

        if (loomChain !== null) {
            const market = loomChain.getMoneyMarket();
            const latestBlock = await loomChain.getProvider().getBlockNumber();
            const event = market.interface.events.SavingsWithdrawn;
            let lastBlock = logWrapper.lastBlockNumber;
            if (!("migration" in logWrapper) || logWrapper.migration === 0) {
                lastBlock = 0;
                logWrapper.migration = 1;
                logWrapper.logs = [];
            }
            if (lastBlock === 0) {
                const transaction = await loomChain
                    .getProvider()
                    .getTransaction(loomChain.config.moneyMarket.transactionHash);
                lastBlock = Number(transaction.blockNumber || 0);
            }

            if (lastBlock < latestBlock) {
                const result = await getSavingsLogsAsync(loomChain, market.address, event, lastBlock, latestBlock);

                if (result) {
                    logWrapper.logs = removeDuplicate([...logWrapper.logs, ...result]);
                    logWrapper.lastBlockNumber = latestBlock;
                    await setLogWrapper(asset.symbol, TYPE, logWrapper);
                }
            }
        }

        return logWrapper.logs || [];
    }, [asset, loomChain]);

    const getCachedLogs = useCallback(async () => {
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
        getCachedLogs,
        getSavingsLogs
    };
};

export default useLogLoader;
