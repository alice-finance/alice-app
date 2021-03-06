import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { BigNumber } from "ethers/utils";
import { Body, Button, CardItem, Left, Right, Text } from "native-base";
import platform from "../../../native-base-theme/variables/platform";
import { Spacing } from "../../constants/dimension";
import { ChainContext } from "../../contexts/ChainContext";
import { EthereumContext } from "../../contexts/EthereumContext";
import { PendingTransactionsContext } from "../../contexts/PendingTransactionsContext";
import useAsyncEffect from "../../hooks/useAsyncEffect";
import preset from "../../styles/preset";
import { openTx } from "../../utils/ether-scan-utils";
import SnackBar from "../../utils/SnackBar";
import Spinner from "../Spinner";
import Steps from "./Steps";

const ERC20ReceiveSteps = ({ asset, amount, currentStep }) => {
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
            <StepsItem currentStep={currentStep} totalSteps={4} />
            {currentStep === 2 ? (
                <ERC20ReceiveStep2 asset={asset} amount={amount} pendingTransaction={pendingTransaction} />
            ) : currentStep === 3 ? (
                <ERC20ReceiveStep3 asset={asset} amount={amount} pendingTransaction={pendingTransaction} />
            ) : currentStep === 4 ? (
                <ERC20ReceiveStep4 asset={asset} amount={amount} pendingTransaction={pendingTransaction} />
            ) : (
                <ERC20ReceiveDone asset={asset} pendingTransaction={pendingTransaction} />
            )}
        </>
    );
};

const ERC20ReceiveStep2 = ({ asset, amount, pendingTransaction }) => {
    return pendingTransaction && !pendingTransaction.blockHash ? (
        <ERC20ReceiveInProgress transaction={pendingTransaction} currentStep={2} />
    ) : (
        <ERC20ReceiveReady asset={asset} amount={amount} currentStep={2} />
    );
};

const ERC20ReceiveStep3 = ({ asset, amount, pendingTransaction }) => {
    return pendingTransaction && !pendingTransaction.blockHash ? (
        <ERC20ReceiveInProgress transaction={pendingTransaction} currentStep={3} />
    ) : (
        <ERC20ReceiveReady asset={asset} amount={amount} currentStep={3} />
    );
};

const ERC20ReceiveStep4 = ({ asset, amount, pendingTransaction }) => {
    return <ERC20ReceiveInProgress transaction={pendingTransaction} currentStep={4} showRefreshButton={true} />;
};

const ERC20ReceiveDone = ({ asset, pendingTransaction }) => {
    const { t } = useTranslation(["home", "common"]);
    const { clearPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const onPress = useCallback(() => {
        if (pendingTransaction.hash) {
            clearPendingDepositTransactions(asset.ethereumAddress);
        }
    }, [asset, pendingTransaction]);
    return (
        <>
            <DescriptionItem description={t("pendingAmount.erc20.done")} />
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

const ERC20ReceiveInProgress = ({ transaction, currentStep, showRefreshButton = false }) => {
    const { t } = useTranslation("home");
    return (
        <>
            <DescriptionItem description={t("pendingAmount.erc20.step" + currentStep + ".inProgress")} />
            {<InProgressItem transaction={transaction} showRefreshButton={showRefreshButton} />}
        </>
    );
};

const ERC20ReceiveReady = ({ asset, amount, currentStep }) => {
    const { t } = useTranslation("home");
    const { ethereumChain } = useContext(ChainContext);
    const [ethBalance, setETHBalance] = useState<BigNumber | null>(null);
    useAsyncEffect(async () => setETHBalance(await ethereumChain!.balanceOfETHAsync()), [ethereumChain]);
    return ethBalance ? (
        ethBalance.isZero() ? (
            <>
                <DescriptionItem
                    description={t("pendingAmount.erc20.notEnoughFee", { symbol: asset.symbol })}
                    error={true}
                />
                <ReceiveFeeButtonItem />
            </>
        ) : (
            <>
                <DescriptionItem description={t("pendingAmount.erc20.step" + currentStep, { symbol: asset.symbol })} />
                {currentStep === 2 ? (
                    <ApproveButtonItem asset={asset} amount={amount} />
                ) : (
                    <DepositERC20ButtonItem asset={asset} amount={amount} />
                )}
            </>
        )
    ) : (
        <Spinner compact={true} />
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

const ReceiveFeeButtonItem = () => {
    const { t } = useTranslation(["home", "common"]);
    const { push } = useNavigation();
    const { ethereumChain } = useContext(ChainContext);
    const { setCurrentBlockNumber } = useContext(EthereumContext);
    const onRefresh = useCallback(async () => {
        setCurrentBlockNumber(await ethereumChain!.getProvider().getBlockNumber());
    }, []);
    const onReceive = useCallback(async () => {
        push("ReceiveStep2", { assetName: "fee" });
    }, []);
    return (
        <CardItem footer={true}>
            <Left />
            <Right>
                <Button primary={true} bordered={true} rounded={true} onPress={onRefresh}>
                    <Text style={preset.fontSize16}>{t("common:refresh")}</Text>
                </Button>
            </Right>
            <Right>
                <Button primary={true} rounded={true} onPress={onReceive}>
                    <Text style={preset.fontSize16}>{t("pendingAmount.erc20.receiveFee")}</Text>
                </Button>
            </Right>
        </CardItem>
    );
};

const ApproveButtonItem = ({ asset, amount }) => {
    const { t } = useTranslation("home");
    const { ethereumChain } = useContext(ChainContext);
    const [pressed, setPressed] = useState(false);
    const { addPendingDepositTransaction, clearPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const onPress = useCallback(async () => {
        setPressed(true);
        try {
            clearPendingDepositTransactions(asset.ethereumAddress);
            const tx = await ethereumChain!.approveERC20Async(asset, ethereumChain!.getGateway().address, amount);
            if (tx && tx.hash) {
                addPendingDepositTransaction(asset.ethereumAddress, tx);
            }
        } catch (e) {
            SnackBar.danger(e.message);
        } finally {
            setPressed(false);
        }
    }, [ethereumChain]);
    return (
        <CardItem footer={true}>
            <Left />
            <Right>
                <Button primary={true} bordered={true} rounded={true} onPress={onPress} disabled={pressed}>
                    <Text style={preset.fontSize16}>{t("pendingAmount.erc20.next")}</Text>
                </Button>
            </Right>
        </CardItem>
    );
};

const DepositERC20ButtonItem = ({ asset, amount }) => {
    const { t } = useTranslation("home");
    const { ethereumChain } = useContext(ChainContext);
    const [pressed, setPressed] = useState(false);
    const { addPendingDepositTransaction } = useContext(PendingTransactionsContext);
    const onPress = useCallback(async () => {
        setPressed(true);
        try {
            const tx = await ethereumChain!.depositERC20Async(asset, amount);
            if (tx && tx.hash) {
                addPendingDepositTransaction(asset.ethereumAddress, tx);
            }
        } catch (e) {
            SnackBar.danger(e.message);
        } finally {
            setPressed(false);
        }
    }, [ethereumChain]);
    return (
        <CardItem footer={true}>
            <Left />
            <Right>
                <Button primary={true} bordered={true} rounded={true} onPress={onPress} disabled={pressed}>
                    <Text style={preset.fontSize16}>{t("pendingAmount.erc20.next")}</Text>
                </Button>
            </Right>
        </CardItem>
    );
};

const InProgressItem = ({ transaction, showRefreshButton }) => {
    const { t } = useTranslation(["home", "common"]);
    const { ethereumChain } = useContext(ChainContext);
    const { setCurrentBlockNumber } = useContext(EthereumContext);
    const onPress = useCallback(() => openTx(transaction.hash), [transaction]);
    const onRefresh = useCallback(async () => {
        setCurrentBlockNumber(await ethereumChain!.getProvider().getBlockNumber());
    }, []);
    return (
        <CardItem footer={true}>
            <Left />
            {showRefreshButton && (
                <Right>
                    <Button primary={true} bordered={true} rounded={true} onPress={onRefresh}>
                        <Text>{t("common:refresh")}</Text>
                    </Button>
                </Right>
            )}
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

export default ERC20ReceiveSteps;
