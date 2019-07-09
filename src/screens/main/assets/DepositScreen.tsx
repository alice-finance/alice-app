import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { ethers } from "ethers";
import { BigNumber } from "ethers/utils";
import { Button, Container, Content, Icon, Text, Toast } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import AmountInput from "../../../components/AmountInput";
import CaptionText from "../../../components/CaptionText";
import DepositInProgress from "../../../components/DepositInProgress";
import HeadlineText from "../../../components/HeadlineText";
import Row from "../../../components/Row";
import TitleText from "../../../components/TitleText";
import { AssetContext } from "../../../contexts/AssetContext";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { PendingTransactionsContext } from "../../../contexts/PendingTransactionsContext";
import useERC20Depositor from "../../../hooks/useERC20Depositor";
import useETHDepositor from "../../../hooks/useETHDepositor";
import useKyberSwap from "../../../hooks/useKyberSwap";
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/big-number-utils";

const DepositScreen = () => {
    const { t } = useTranslation(["asset"]);
    const { navigate, pop, getParam } = useNavigation();
    const { getPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const [amount, setAmount] = useState<BigNumber | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<ERC20Asset | null>(null);
    const [inProgress, setInProgress] = useState(false);
    const { swapToken } = useKyberSwap();
    const onCancel = useCallback(() => {
        setAmount(null);
        setSelectedAsset(null);
    }, []);
    const onOk = useCallback(async () => {
        setInProgress(true);
        if (asset.symbol === selectedAsset!.symbol) {
            try {
                if (asset.ethereumAddress.isZero()) {
                    await depositETH(amount!);
                } else {
                    await depositERC20(asset, amount!);
                }
                pop();
                Toast.show({ text: t("depositSuccess") });
            } catch (e) {
                if (e.code === "INSUFFICIENT_FUNDS") {
                    let text = t("insufficientFunds");
                    if (e.transaction) {
                        const gas = ethers.utils.formatEther(e.transaction.gasPrice.mul(e.transaction.gasLimit));
                        text = text + " (" + gas + " ETH)";
                    }
                    Toast.show({ text });
                } else {
                    Toast.show({ text: t("depositChangeFailure") });
                }
            } finally {
                setAmount(null);
                setInProgress(false);
            }
        } else {
            try {
                const result = await swapToken(asset, selectedAsset!, amount!);
                if (selectedAsset!.ethereumAddress.isZero()) {
                    await depositETH(result.convertedAmount);
                } else {
                    await depositERC20(selectedAsset!, result.convertedAmount);
                }
                navigate("ManageAsset", { asset: selectedAsset });
                Toast.show({ text: t("depositSuccess") });
            } catch (e) {
            } finally {
                setAmount(null);
                setInProgress(false);
            }
        }
    }, [selectedAsset, amount]);

    const asset: ERC20Asset = getParam("asset");
    const { deposit: depositETH } = useETHDepositor();
    const { deposit: depositERC20 } = useERC20Depositor();
    const pendingDepositTransactions = getPendingDepositTransactions(asset.ethereumAddress);
    const onAmountNext = useCallback(
        assetAmount => {
            if (!asset.ethereumAddress.isZero()) {
                setSelectedAsset(asset);
            }
            setAmount(assetAmount);
        },
        [asset]
    );
    return (
        <Container>
            <Content>
                <TitleText aboveText={true}>{t("deposit")}</TitleText>
                <CaptionText>{t("deposit.description")}</CaptionText>
                <View style={[preset.marginNormal, preset.marginTopLarge]}>
                    {inProgress || pendingDepositTransactions.length > 0 ? (
                        <DepositInProgress asset={selectedAsset ? selectedAsset : asset} />
                    ) : selectedAsset && amount ? (
                        <Confirm
                            assetFrom={asset}
                            amount={amount}
                            assetTo={selectedAsset}
                            onCancel={onCancel}
                            onOk={onOk}
                        />
                    ) : amount ? (
                        <ConversionControls asset={asset} amount={amount!} onNext={setSelectedAsset} />
                    ) : (
                        <AmountControls asset={asset} onNext={onAmountNext} />
                    )}
                </View>
            </Content>
        </Container>
    );
};

interface ConversionControlsProps {
    asset: ERC20Asset;
    amount: BigNumber;
    onNext: (asset: ERC20Asset) => void;
}

const ConversionControls = ({ asset, amount, onNext }: ConversionControlsProps) => {
    const { t } = useTranslation(["asset", "common"]);
    const { assets } = useContext(AssetContext);

    return (
        <View>
            <HeadlineText aboveText={true}>{t("tokenConversion")}</HeadlineText>
            <CaptionText small={true}>{t("tokenConversion.description")}</CaptionText>
            <Button
                block={true}
                rounded={true}
                onPress={useCallback(() => onNext(asset), [])}
                style={[preset.marginSmall, preset.marginTopLarge]}>
                <Text>
                    {asset.ethereumAddress.isZero() ? t("tokenConversion.no", { symbol: asset.symbol }) : t("transfer")}
                </Text>
            </Button>
            {asset.ethereumAddress.isZero() &&
                assets
                    .filter(a => a.symbol !== asset.symbol)
                    .map((a, key) => (
                        <SwapButton
                            key={key}
                            assetFrom={asset}
                            assetTo={a}
                            amount={amount}
                            onPress={useCallback(() => onNext(a), [])}
                        />
                    ))}
        </View>
    );
};

const SwapButton = ({ assetFrom, assetTo, amount, onPress }) => {
    const { t } = useTranslation(["asset", "common", "finance"]);
    const [enabled, setEnabled] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [rate, setRate] = useState<BigNumber>(toBigNumber(0));
    const [toAmount, setToAmount] = useState<BigNumber>(toBigNumber(0));
    const { ready, checkRate } = useKyberSwap();

    useEffect(() => {
        const getRate = async () => {
            const { expectedRate } = await checkRate(assetFrom, assetTo, amount);
            setLoaded(true);
            setRate(expectedRate);
            setToAmount(expectedRate.mul(amount).div(toBigNumber(10).pow(18)));

            if (!expectedRate.isZero()) {
                setEnabled(true);
            }
        };

        if (ready) {
            getRate();
        }
    }, [ready, amount]);

    return (
        <View>
            <Button
                block={true}
                rounded={true}
                bordered={true}
                transparent={true}
                disabled={!(loaded && enabled)}
                onPress={onPress}
                style={preset.marginSmall}>
                <Text>
                    {loaded
                        ? rate.isZero()
                            ? t("tokenConversion.notAvailable", { symbol: assetTo.symbol })
                            : t("tokenConversion.available", {
                                  symbol: assetTo.symbol,
                                  amount: formatValue(toAmount, assetTo.decimals, 2)
                              })
                        : t("finance:loading")}
                </Text>
            </Button>
        </View>
    );
};

interface AmountControlsProps {
    asset: ERC20Asset;
    onNext: (amount: BigNumber) => void;
}

const AmountControls = ({ asset, onNext }: AmountControlsProps) => {
    const { t } = useTranslation(["asset", "common"]);
    const { getBalance } = useContext(BalancesContext);
    const [amount, setAmount] = useState<BigNumber | null>(toBigNumber(0));
    const ethereumBalance = getBalance(asset.ethereumAddress);
    return (
        <View>
            <AmountInput asset={asset} max={ethereumBalance} onChangeAmount={setAmount} style={preset.marginSmall} />
            <View style={[preset.marginLeftNormal, preset.marginRightNormal]}>
                <Row
                    label={t("available")}
                    value={formatValue(ethereumBalance, asset!.decimals, 2) + " " + asset!.symbol}
                />
            </View>
            <Button
                primary={true}
                rounded={true}
                block={true}
                disabled={!amount || amount.isZero()}
                style={preset.marginTopNormal}
                onPress={useCallback(() => onNext(amount!), [amount])}>
                <Text>{t("common:next")}</Text>
            </Button>
        </View>
    );
};

interface ConfirmProps {
    assetFrom: ERC20Asset;
    amount: BigNumber;
    assetTo: ERC20Asset;
    onCancel: () => void;
    onOk: () => void;
}

const Confirm = ({ assetFrom, amount, assetTo, onCancel, onOk }: ConfirmProps) => {
    const { t } = useTranslation(["asset"]);
    const { getBalance } = useContext(BalancesContext);
    const needSwap = assetFrom.symbol !== assetTo.symbol;
    const loomBalance = getBalance(assetTo.loomAddress);

    return (
        <View style={preset.marginNormal}>
            <Text>{t("wouldYouChangeTheDepositAmount")}</Text>
            <View style={[preset.marginTopNormal, preset.marginBottomNormal, styles.border]} />
            <Value value={loomBalance} asset={assetTo} />
            <Icon
                type="SimpleLineIcons"
                name="arrow-down-circle"
                style={[preset.marginSmall, preset.alignCenter, preset.colorGrey]}
            />
            {needSwap ? (
                <SwapConfirm
                    balance={loomBalance}
                    value={amount}
                    assetFrom={assetFrom}
                    assetTo={assetTo}
                    onCancel={onCancel}
                    onOk={onOk}
                />
            ) : (
                <PlusConfirm balance={loomBalance} value={amount} asset={assetFrom} onCancel={onCancel} onOk={onOk} />
            )}
        </View>
    );
};

const Value = ({ asset, value }: { asset: ERC20Asset; value: BigNumber }) => (
    <Text style={[preset.fontSize36, preset.textAlignCenter, preset.paddingSmall, preset.flex1]}>
        {formatValue(value, asset.decimals, 2) + " " + asset.symbol}
    </Text>
);

interface PlusConfirmProps {
    balance: BigNumber;
    asset: ERC20Asset;
    value: BigNumber;
    onCancel: () => void;
    onOk: () => void;
}

const PlusConfirm = ({ balance, asset, value, onCancel, onOk }: PlusConfirmProps) => {
    const { t } = useTranslation(["asset", "common", "finance"]);
    return (
        <>
            <Value value={balance.add(value)} asset={asset} />
            <View style={[preset.marginTopNormal, preset.marginBottomNormal, styles.border]} />
            <View style={[preset.flexDirectionRow, preset.marginTopNormal]}>
                <Button
                    primary={true}
                    rounded={true}
                    bordered={true}
                    block={true}
                    onPress={onCancel}
                    style={[preset.flex1, preset.marginRightSmall]}>
                    <Text>{t("common:cancel")}</Text>
                </Button>
                <Button primary={true} rounded={true} block={true} onPress={onOk} style={preset.flex1}>
                    <Text>{t("common:ok")}</Text>
                </Button>
            </View>
        </>
    );
};

interface SwapConfirmProps {
    balance: BigNumber;
    assetFrom: ERC20Asset;
    assetTo: ERC20Asset;
    value: BigNumber;
    onCancel: () => void;
    onOk: () => void;
}

const SwapConfirm = ({ balance, assetFrom, assetTo, value, onCancel, onOk }: SwapConfirmProps) => {
    const { t } = useTranslation(["asset", "common", "finance"]);
    const [enabled, setEnabled] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [rate, setRate] = useState<BigNumber>(toBigNumber(0));
    const [amount, setAmount] = useState<BigNumber>(toBigNumber(0));
    const { ready, checkRate } = useKyberSwap();

    useEffect(() => {
        const getRate = async () => {
            const { expectedRate } = await checkRate(assetFrom, assetTo, value);
            setLoaded(true);
            setRate(expectedRate);
            setAmount(expectedRate.mul(value).div(toBigNumber(10).pow(18)));

            if (!expectedRate.isZero()) {
                setEnabled(true);
            }
        };

        if (ready) {
            getRate();
        }
    }, [ready, checkRate]);

    // check(assetFrom, assetTo, value);
    return (
        <>
            {loaded ? (
                <Value value={balance.add(amount)} asset={assetTo} />
            ) : (
                <Text style={[preset.fontSize36, preset.textAlignCenter, preset.paddingSmall, preset.flex1]}>
                    {t("finance:loading")}
                </Text>
            )}
            <View style={[preset.marginTopNormal, preset.marginBottomNormal, styles.border]} />
            <View style={[preset.flexDirectionRow, preset.marginTopNormal]}>
                <Button
                    primary={true}
                    rounded={true}
                    bordered={true}
                    block={true}
                    onPress={onCancel}
                    style={[preset.flex1, preset.marginRightSmall]}>
                    <Text>{t("common:cancel")}</Text>
                </Button>
                <Button
                    primary={true}
                    rounded={true}
                    block={true}
                    onPress={onOk}
                    style={preset.flex1}
                    disabled={!(loaded && enabled)}>
                    <Text>{t("common:ok")}</Text>
                </Button>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    border: { height: 2, backgroundColor: platform.listDividerBg }
});

export default DepositScreen;
