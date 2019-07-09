import { useCallback, useContext, useEffect, useState } from "react";

import { ERC20Asset } from "@alice-finance/alice.js";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { ethers } from "ethers";
import { BigNumber } from "ethers/utils";
import { ChainContext } from "../contexts/ChainContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import { SavingsContext } from "../contexts/SavingsContext";
import useTokenBalanceUpdater from "./useTokenBalanceUpdater";

/* tslint:disable-next-line */
const KYBER_NETWORK_PROXY_ABI = [{ "constant": false, "inputs": [{ "name": "alerter", "type": "address" }], "name": "removeAlerter", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "enabled", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "pendingAdmin", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getOperators", "outputs": [{ "name": "", "type": "address[]" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "src", "type": "address" }, { "name": "srcAmount", "type": "uint256" }, { "name": "dest", "type": "address" }, { "name": "destAddress", "type": "address" }, { "name": "maxDestAmount", "type": "uint256" }, { "name": "minConversionRate", "type": "uint256" }, { "name": "walletId", "type": "address" }, { "name": "hint", "type": "bytes" }], "name": "tradeWithHint", "outputs": [{ "name": "", "type": "uint256" }], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "name": "token", "type": "address" }, { "name": "srcAmount", "type": "uint256" }, { "name": "minConversionRate", "type": "uint256" }], "name": "swapTokenToEther", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "token", "type": "address" }, { "name": "amount", "type": "uint256" }, { "name": "sendTo", "type": "address" }], "name": "withdrawToken", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "maxGasPrice", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newAlerter", "type": "address" }], "name": "addAlerter", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "kyberNetworkContract", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "user", "type": "address" }], "name": "getUserCapInWei", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "src", "type": "address" }, { "name": "srcAmount", "type": "uint256" }, { "name": "dest", "type": "address" }, { "name": "minConversionRate", "type": "uint256" }], "name": "swapTokenToToken", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newAdmin", "type": "address" }], "name": "transferAdmin", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "claimAdmin", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "token", "type": "address" }, { "name": "minConversionRate", "type": "uint256" }], "name": "swapEtherToToken", "outputs": [{ "name": "", "type": "uint256" }], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newAdmin", "type": "address" }], "name": "transferAdminQuickly", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getAlerters", "outputs": [{ "name": "", "type": "address[]" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "src", "type": "address" }, { "name": "dest", "type": "address" }, { "name": "srcQty", "type": "uint256" }], "name": "getExpectedRate", "outputs": [{ "name": "expectedRate", "type": "uint256" }, { "name": "slippageRate", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "user", "type": "address" }, { "name": "token", "type": "address" }], "name": "getUserCapInTokenWei", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOperator", "type": "address" }], "name": "addOperator", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_kyberNetworkContract", "type": "address" }], "name": "setKyberNetworkContract", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "operator", "type": "address" }], "name": "removeOperator", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "field", "type": "bytes32" }], "name": "info", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "src", "type": "address" }, { "name": "srcAmount", "type": "uint256" }, { "name": "dest", "type": "address" }, { "name": "destAddress", "type": "address" }, { "name": "maxDestAmount", "type": "uint256" }, { "name": "minConversionRate", "type": "uint256" }, { "name": "walletId", "type": "address" }], "name": "trade", "outputs": [{ "name": "", "type": "uint256" }], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }, { "name": "sendTo", "type": "address" }], "name": "withdrawEther", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "token", "type": "address" }, { "name": "user", "type": "address" }], "name": "getBalance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "admin", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [{ "name": "_admin", "type": "address" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "trader", "type": "address" }, { "indexed": false, "name": "src", "type": "address" }, { "indexed": false, "name": "dest", "type": "address" }, { "indexed": false, "name": "actualSrcAmount", "type": "uint256" }, { "indexed": false, "name": "actualDestAmount", "type": "uint256" }], "name": "ExecuteTrade", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newNetworkContract", "type": "address" }, { "indexed": false, "name": "oldNetworkContract", "type": "address" }], "name": "KyberNetworkSet", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "token", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "sendTo", "type": "address" }], "name": "TokenWithdraw", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "sendTo", "type": "address" }], "name": "EtherWithdraw", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "pendingAdmin", "type": "address" }], "name": "TransferAdminPending", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAdmin", "type": "address" }, { "indexed": false, "name": "previousAdmin", "type": "address" }], "name": "AdminClaimed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAlerter", "type": "address" }, { "indexed": false, "name": "isAdd", "type": "bool" }], "name": "AlerterAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newOperator", "type": "address" }, { "indexed": false, "name": "isAdd", "type": "bool" }], "name": "OperatorAdded", "type": "event" }];
const KYBER_NETWORK_PROXY_ADDRESS = {
    "1": "0x818e6fecd516ecc3849daf6845e3ec868087b755",
    "4": "0xF77eC7Ed5f5B9a5aee4cfa6FFCaC6A4C315BaC76"
};
const KYBER_NETWORK_ETHEREUM_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const KYBER_MAX_ALLOWANCE = toBigNumber(2).pow(255);

interface KyberRate {
    expectedRate: BigNumber;
    slippageRate: BigNumber;
}

interface KyberResult {
    fromAmount: BigNumber;
    convertedAmount: BigNumber;
}

const getAddressForKyber = (asset: ERC20Asset): string => {
    let address = asset.ethereumAddress.toLocalAddressString();
    if (asset.symbol === "ETH") {
        address = KYBER_NETWORK_ETHEREUM_ADDRESS;
    }

    return address;
};

const useKyberSwap = () => {
    const { decimals } = useContext(SavingsContext);
    const { ethereumChain } = useContext(ChainContext);
    const [kyber, setKyber] = useState<ethers.Contract | null>(null);
    const [ready, setReady] = useState(false);
    const { update } = useTokenBalanceUpdater();
    const { addPendingDepositTransaction, clearPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const multiplier = toBigNumber(10).pow(decimals);

    useEffect(() => {
        if (ethereumChain !== null) {
            const kyberProxy = new ethers.Contract(
                KYBER_NETWORK_PROXY_ADDRESS[ethereumChain.config.chainId],
                KYBER_NETWORK_PROXY_ABI,
                ethereumChain.getSigner()
            );
            setKyber(kyberProxy);
            setReady(true);
        }
    }, [ethereumChain]);

    const checkRate = useCallback(
        async (assetFrom: ERC20Asset, assetTo: ERC20Asset, amount: BigNumber): Promise<KyberRate> => {
            if (kyber !== null) {
                const fromAddress = getAddressForKyber(assetFrom);
                const toAddress = getAddressForKyber(assetTo);

                const { expectedRate, slippageRate }: KyberRate = await kyber.getExpectedRate(
                    fromAddress,
                    toAddress,
                    amount
                );

                // return {
                //     expectedRate: amount.mul(expectedRate).div(multiplier),
                //     slippageRate: amount.mul(slippageRate).div(multiplier)
                // };
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
        async (assetFrom: ERC20Asset, assetTo: ERC20Asset, amount: BigNumber): Promise<KyberResult> => {
            const result = {
                fromAmount: toBigNumber(0),
                convertedAmount: toBigNumber(0)
            };

            if (kyber !== null && ethereumChain !== null) {
                try {
                    let value = toBigNumber(0);
                    const fromAddress = getAddressForKyber(assetFrom);
                    const toAddress = getAddressForKyber(assetTo);
                    clearPendingDepositTransactions(assetFrom.ethereumAddress);

                    // Try to swap token
                    if (assetFrom.symbol !== "ETH") {
                        const fromERC20 = await ethereumChain.createERC20(assetFrom);
                        const approvedAmount: BigNumber = await fromERC20.allowance(
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
                        throw Error("CANNOT EXCHANGE: RATE IS ZERO");
                    }

                    // Trade
                    const tradeTx = await kyber.trade(
                        fromAddress,
                        value,
                        toAddress,
                        ethereumChain.getAddress().toLocalAddressString(),
                        KYBER_MAX_ALLOWANCE,
                        rate.slippageRate,
                        "0x0000000000000000000000000000000000000000",
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
                        throw Error("EVENTS NOT FIRED!");
                    }

                    await update();
                    clearPendingDepositTransactions(assetFrom.ethereumAddress);
                    // Done!
                } catch (e) {
                    clearPendingDepositTransactions(assetFrom.ethereumAddress);
                    throw e;
                }
            }

            return result;
        },
        [ethereumChain, kyber]
    );

    return { ready, checkRate, swapToken };
};

export default useKyberSwap;
