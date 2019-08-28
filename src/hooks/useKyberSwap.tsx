import { useCallback, useContext, useEffect, useState } from "react";
import { KYBER_FEE_SHARING_ADDRESS } from "react-native-dotenv";

import { Address, ERC20Asset, EthereumChain } from "@alice-finance/alice.js";
import { ZERO_ADDRESS } from "@alice-finance/alice.js/dist/constants";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { getLogs } from "@alice-finance/alice.js/dist/utils/ethers-utils";
import { ethers } from "ethers";
import { ChainContext } from "../contexts/ChainContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import useAssetBalancesUpdater from "./useAssetBalancesUpdater";

const KYBER_NETWORK_PROXY_ADDRESS = {
    "1": "0x818e6fecd516ecc3849daf6845e3ec868087b755",
    "4": "0xF77eC7Ed5f5B9a5aee4cfa6FFCaC6A4C315BaC76"
};
const KYBER_NETWORK_ETHEREUM_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const KYBER_MAX_ALLOWANCE = toBigNumber(2).pow(255);

interface KyberRate {
    expectedRate: ethers.utils.BigNumber;
    slippageRate: ethers.utils.BigNumber;
}

interface KyberResult {
    fromAmount: ethers.utils.BigNumber;
    convertedAmount: ethers.utils.BigNumber;
}

export interface TokenSwapped {
    log: ethers.providers.Log;
    src: string;
    dest: string;
    actualDestAmount: ethers.utils.BigNumber;
    actualSrcAmount: ethers.utils.BigNumber;
}

const getAddressForKyber = (asset: ERC20Asset): string => {
    let address = asset.ethereumAddress.toLocalAddressString();
    if (asset.symbol === "ETH") {
        address = KYBER_NETWORK_ETHEREUM_ADDRESS;
    }

    return address;
};

const convertAddressToKyber = (address: Address): Address => {
    if (address.isZero()) {
        return Address.createEthereumAddress(KYBER_NETWORK_ETHEREUM_ADDRESS);
    }

    return address;
};

const getKyberSwapLogsAsync = async (
    kyber: ethers.Contract,
    ethereumChain: EthereumChain,
    sourceAsset: ERC20Asset,
    fromBlock: number,
    toBlock: number
) => {
    const provider = ethereumChain.getProvider();
    if (fromBlock === 0) {
        const transaction = await provider.getTransaction(ethereumChain.config.gateway.transactionHash);
        fromBlock = Number(transaction.blockNumber || 0);
    }
    if (toBlock === 0) {
        const blockNumber = await provider.getBlockNumber();
        toBlock = Number(blockNumber);
    }
    const event = kyber.interface.events.ExecuteTrade;
    const address = convertAddressToKyber(sourceAsset.ethereumAddress);
    const logs = await getLogs(provider, {
        address: kyber.address,
        topics: [event.topic, ethers.utils.hexZeroPad(ethereumChain.getAddress().toLocalAddressString(), 32)],
        fromBlock,
        toBlock
    });
    // noinspection TypeScriptValidateJSTypes
    return logs
        .sort((l1, l2) => (l2.blockNumber || 0) - (l1.blockNumber || 0))
        .map(log => ({
            log,
            ...event.decode(log.data)
        }))
        .filter(data => Address.createEthereumAddress(data.src || ZERO_ADDRESS).equals(address));
};

const useKyberSwap = () => {
    const { ethereumChain } = useContext(ChainContext);
    const [kyber, setKyber] = useState<ethers.Contract | null>(null);
    const [ready, setReady] = useState(false);
    const { update } = useAssetBalancesUpdater();
    const { addPendingDepositTransaction, clearPendingDepositTransactions } = useContext(PendingTransactionsContext);

    useEffect(() => {
        if (ethereumChain !== null) {
            const kyberProxy = new ethers.Contract(
                KYBER_NETWORK_PROXY_ADDRESS[ethereumChain.config.chainId],
                require("../contracts/abis/KyberNetworkProxy.json"),
                ethereumChain.getSigner()
            );
            setKyber(kyberProxy);
            setReady(true);
        }
    }, [ethereumChain]);

    const checkRate = useCallback(
        async (assetFrom: ERC20Asset, assetTo: ERC20Asset, amount: ethers.utils.BigNumber): Promise<KyberRate> => {
            if (kyber !== null) {
                const fromAddress = getAddressForKyber(assetFrom);
                const toAddress = getAddressForKyber(assetTo);

                const { expectedRate, slippageRate }: KyberRate = await kyber.getExpectedRate(
                    fromAddress,
                    toAddress,
                    amount
                );

                return {
                    expectedRate,
                    slippageRate
                };
            }

            return {
                expectedRate: toBigNumber(0),
                slippageRate: toBigNumber(0)
            };
        },
        [ethereumChain, kyber]
    );

    const swapToken = useCallback(
        async (assetFrom: ERC20Asset, assetTo: ERC20Asset, amount: ethers.utils.BigNumber): Promise<KyberResult> => {
            const result = {
                fromAmount: toBigNumber(0),
                convertedAmount: toBigNumber(0)
            };

            if (kyber !== null && ethereumChain !== null) {
                let value = toBigNumber(0);
                const fromAddress = getAddressForKyber(assetFrom);
                const toAddress = getAddressForKyber(assetTo);
                clearPendingDepositTransactions(assetFrom.ethereumAddress);

                // Try to swap token
                if (assetFrom.symbol !== "ETH") {
                    const fromERC20 = await ethereumChain.createERC20(assetFrom);
                    const approvedAmount: ethers.utils.BigNumber = await fromERC20.allowance(
                        ethereumChain.getAddress().toLocalAddressString(),
                        kyber.address
                    );

                    if (approvedAmount.lt(amount)) {
                        // Try to approve...
                        const approveTx = await fromERC20.approve(kyber.address, KYBER_MAX_ALLOWANCE);
                        addPendingDepositTransaction(assetFrom.ethereumAddress, approveTx);
                        await approveTx.wait();
                        // approved!
                    }
                } else {
                    value = amount;
                }

                // Checking rate
                const rate = await checkRate(assetFrom, assetTo, amount);

                if (rate.expectedRate.isZero() || rate.slippageRate.isZero()) {
                    throw Error("Got ZERO exchange rate.");
                }

                // Trade
                const tradeTx = await kyber.trade(
                    fromAddress,
                    value,
                    toAddress,
                    ethereumChain.getAddress().toLocalAddressString(),
                    KYBER_MAX_ALLOWANCE,
                    rate.slippageRate,
                    KYBER_FEE_SHARING_ADDRESS || "0x0000000000000000000000000000000000000000",
                    { value, gasLimit: 500000 }
                );
                addPendingDepositTransaction(assetFrom.ethereumAddress, tradeTx);
                const receipt = await tradeTx.wait();
                // Traded!

                if (receipt.events && receipt.events.length > 0) {
                    // Checking events
                    receipt.events.forEach(event => {
                        if (event.event === "ExecuteTrade") {
                            result.fromAmount = event.args[3];
                            result.convertedAmount = event.args[4];
                        }
                    });
                } else {
                    throw Error("Cannot get ExecuteTrade event");
                }

                await update();
                clearPendingDepositTransactions(assetFrom.ethereumAddress);
            }

            return result;
        },
        [ethereumChain, kyber]
    );

    const getSwapLogsAsync = useCallback(
        async (sourceAsset: ERC20Asset, fromBlock: number = 0, toBlock: number = 0) => {
            if (kyber != null && ethereumChain != null) {
                return getKyberSwapLogsAsync(kyber, ethereumChain, sourceAsset, fromBlock, toBlock);
            } else {
                return [];
            }
        },
        [ethereumChain, kyber]
    );

    return { ready, checkRate, swapToken, getSwapLogsAsync };
};

export default useKyberSwap;
