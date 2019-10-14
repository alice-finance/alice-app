import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { Body, Button, CardItem, Icon, Left, Right, Text } from "native-base";
import platform from "../../../native-base-theme/variables/platform";
import { Spacing } from "../../constants/dimension";
import { ETH_MAX_FEE } from "../../constants/token";
import { AssetContext } from "../../contexts/AssetContext";
import { ChainContext } from "../../contexts/ChainContext";
import { PendingTransactionsContext } from "../../contexts/PendingTransactionsContext";
import useAsyncEffect from "../../hooks/useAsyncEffect";
import useKyberNetworkProxy from "../../hooks/useKyberNetworkProxy";
import preset from "../../styles/preset";
import { openTx } from "../../utils/ether-scan-utils";
import SnackBar from "../../utils/SnackBar";
import Spinner from "../Spinner";
import BigNumberText from "../texts/BigNumberText";
import Steps from "./Steps";

const ETHReceiveSteps = ({ asset, amount, currentStep }) => {
    const { getLastPendingDepositTransaction, confirmPendingDepositTransaction } = useContext(
        PendingTransactionsContext
    );
    const { ethereumChain } = useContext(ChainContext);
    const pendingTransaction = getLastPendingDepositTransaction(asset.ethereumAddress);
    useAsyncEffect(async () => {
        if (pendingTransaction && !pendingTransaction.blockHash) {
            confirmPendingDepositTransaction(asset.ethereumAddress, await pendingTransaction.wait());
        }
    }, [pendingTransaction]);
    useAsyncEffect(async () => {
        if (pendingTransaction && pendingTransaction.hash && !pendingTransaction.blockHash) {
            const receipt = await ethereumChain!.getProvider().getTransactionReceipt(pendingTransaction.hash);
            confirmPendingDepositTransaction(asset.ethereumAddress, receipt);
        }
    }, [pendingTransaction]);
    return (
        <>
            <StepsItem currentStep={currentStep} totalSteps={2} />
            {currentStep === 2 ? (
                <ETHReceiveStep2 asset={asset} amount={amount} pendingTransaction={pendingTransaction} />
            ) : (
                <ETHReceiveDone asset={asset} pendingTransaction={pendingTransaction} />
            )}
        </>
    );
};

const ETHReceiveStep2 = ({ asset, amount, pendingTransaction }) => {
    return pendingTransaction && !pendingTransaction.blockHash ? (
        <ETHReceiveStep2InProgress transaction={pendingTransaction} />
    ) : (
        <ETHReceiveStep2Ready asset={asset} amount={amount} />
    );
};

const ETHReceiveStep2Ready = ({ asset, amount }) => {
    const { t } = useTranslation("home");
    const { getAssetBySymbol } = useContext(AssetContext);
    const dai = getAssetBySymbol("DAI")!;
    const amountToConvert = amount.sub(ETH_MAX_FEE);
    const { rate, swapEtherToToken } = useKyberNetworkProxy(asset, dai, amountToConvert);
    return rate ? (
        <>
            <DescriptionItem description={t("pendingAmount.eth.step2")} />
            <ConvertView
                fromAmount={amountToConvert}
                fromAsset={asset}
                toAmount={amountToConvert.mul(rate.expectedRate).div(toBigNumber(10).pow(dai.decimals))}
                toAsset={dai}
            />
            <ConvertButtonItem asset={asset} rate={rate} swap={swapEtherToToken} />
        </>
    ) : (
        <Spinner compact={true} />
    );
};

const ETHReceiveDone = ({ asset, pendingTransaction }) => {
    const { t } = useTranslation(["home", "common"]);
    const { clearPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const onPress = useCallback(() => {
        if (pendingTransaction.hash) {
            clearPendingDepositTransactions(asset.ethereumAddress);
        }
    }, [asset, pendingTransaction]);
    return (
        <>
            <DescriptionItem description={t("pendingAmount.eth.done")} />
            <CardItem footer={true}>
                <Left />
                <Right>
                    <Button primary={true} bordered={true} rounded={true} onPress={onPress}>
                        <Text style={preset.fontSize16}>{t("common:ok")}</Text>
                    </Button>
                </Right>
            </CardItem>
        </>
    );
};

const ConvertView = ({ fromAsset, toAsset, fromAmount, toAmount }) => {
    return (
        <View style={preset.marginSmall}>
            <View style={[preset.flexDirectionRow, preset.justifyContentCenter, preset.alignItemsCenter]}>
                <BigNumberText value={fromAmount} suffix={" " + fromAsset.symbol} style={preset.colorGrey} />
                <Icon
                    name={"arrow-right-circle"}
                    type={"SimpleLineIcons"}
                    style={[preset.fontSize16, preset.colorGrey, preset.marginLeftSmall, preset.marginRightSmall]}
                />
                <BigNumberText value={toAmount} suffix={" " + toAsset.symbol} style={preset.colorGrey} />
            </View>
        </View>
    );
};

const ConvertButtonItem = ({ asset, rate, swap }) => {
    const { t } = useTranslation("home");
    const [pressed, setPressed] = useState(false);
    const { addPendingDepositTransaction, clearPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const onPress = useCallback(async () => {
        setPressed(true);
        try {
            clearPendingDepositTransactions(asset.ethereumAddress);
            const tx = await swap();
            if (tx && tx.hash) {
                addPendingDepositTransaction(asset.ethereumAddress, tx);
            }
        } catch (e) {
            SnackBar.danger(e.message);
        } finally {
            setPressed(false);
        }
    }, [rate, swap]);
    return (
        <CardItem footer={true}>
            <Left />
            <Right>
                <Button primary={true} bordered={true} rounded={true} onPress={onPress} disabled={pressed}>
                    <Text style={preset.fontSize16}>{t("pendingAmount.eth.convertToDai")}</Text>
                </Button>
            </Right>
        </CardItem>
    );
};

const ETHReceiveStep2InProgress = ({ transaction }) => {
    const { t } = useTranslation("home");
    return (
        <>
            <DescriptionItem description={t("pendingAmount.eth.step2.inProgress")} />
            <InProgressItem transaction={transaction} />
        </>
    );
};

const StepsItem = ({ currentStep, totalSteps }) => {
    const { t } = useTranslation("home");
    const labels = [];
    for (let i = 0; i < totalSteps; i++) {
        labels.push(t("pendingAmount.stepN", { step: i + 1 }));
    }
    return (
        <CardItem>
            <Left style={[preset.justifyContentCenter]}>
                <Steps
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    labels={labels}
                    doneLabel={t("pendingAmount.done")}
                />
            </Left>
        </CardItem>
    );
};

const DescriptionItem = ({ description, error = false }) => (
    <CardItem>
        <Body>
            <Text style={[preset.fontSize14, error ? preset.colorDanger : preset.colorGrey]}>{description}</Text>
        </Body>
    </CardItem>
);

const InProgressItem = ({ transaction }) => {
    const { t } = useTranslation("home");
    const onPress = useCallback(() => openTx(transaction.hash), [transaction]);
    return (
        <CardItem footer={true}>
            <Left />
            <Right>
                <Button success={true} bordered={true} rounded={true} onPress={onPress}>
                    <View style={{ width: Spacing.small }} />
                    <Spinner compact={true} small={true} color={platform.brandSuccess} />
                    <Text>{t("pendingAmount.viewTx")}</Text>
                </Button>
            </Right>
        </CardItem>
    );
};

export default ETHReceiveSteps;
