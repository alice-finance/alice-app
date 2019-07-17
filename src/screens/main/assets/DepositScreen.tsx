import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, StyleSheet, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { ethers } from "ethers";
import { BigNumber } from "ethers/utils";
import { Button, Container, Content, Icon, Text } from "native-base";
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
import SnackBar from "../../../utils/SnackBar";

const DepositScreen = () => {
    const { t } = useTranslation(["asset"]);
    const { navigate, pop, getParam } = useNavigation();
    const { getPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const [amount, setAmount] = useState<BigNumber | null>(null);
    const [amountTo, setAmountTo] = useState<BigNumber | null>();
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
                SnackBar.success(t("depositSuccess"));
            } catch (e) {
                if (e.code === "INSUFFICIENT_FUNDS") {
                    let text = t("insufficientFunds");
                    if (e.transaction) {
                        const gas = ethers.utils.formatEther(e.transaction.gasPrice.mul(e.transaction.gasLimit));
                        text = text + " (" + gas + " ETH)";
                    }
                    SnackBar.danger(text);
                } else {
                    SnackBar.danger(e.message);
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
                SnackBar.success(t("depositSuccess"));
            } catch (e) {
                SnackBar.danger(e.message);
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
    useEffect(() => {
        return () => {
            setTimeout(() => Keyboard.dismiss(), 500);
        };
    }, []);

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
                            amountTo={amountTo ? amountTo : amount}
                            onCancel={onCancel}
                            onOk={onOk}
                        />
                    ) : amount ? (
                        <ConversionControls
                            asset={asset}
                            amount={amount!}
                            setAmountTo={setAmountTo}
                            onNext={setSelectedAsset}
                        />
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
    setAmountTo: (amountTo: BigNumber) => void;
    onNext: (asset: ERC20Asset) => void;
}

const ConversionControls = ({ asset, amount, setAmountTo, onNext }: ConversionControlsProps) => {
    const { t } = useTranslation(["asset", "common"]);
    const { assets } = useContext(AssetContext);
    const [amountToList, setAmountToList] = useState<{}>({});
    const totalCount = assets.filter(a => a.symbol !== asset.symbol).length;
    const [loadCount, setLoadCount] = useState(0);
    const { ready, checkRate } = useKyberSwap();

    const getRate = useCallback(
        async (assetTo: ERC20Asset) => {
            if (ready) {
                const rate = await checkRate(asset, assetTo, amount);
                const amountTo = rate.expectedRate.mul(amount).div(toBigNumber(10).pow(18));
                setAmountToList(Object.assign({}, amountToList, { [assetTo.symbol]: amountTo }));
                setLoadCount(loadCount + 1);
            }
        },
        [ready, asset, amount, amountToList, loadCount]
    );

    useEffect(() => {
        if (ready) {
            assets
                .filter(a => a.symbol !== asset.symbol)
                .forEach(e => {
                    getRate(e);
                });
        }
    }, [ready, assets, asset]);

    return (
        <View>
            <HeadlineText aboveText={true}>{t("tokenConversion")}</HeadlineText>
            <CaptionText small={true}>{t("tokenConversion.description")}</CaptionText>
            <Button
                block={true}
                rounded={true}
                onPress={useCallback(() => onNext(asset), [])}
                disabled={totalCount > loadCount}
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
                            assetTo={a}
                            amountTo={a.symbol in amountToList ? amountToList[a.symbol] : null}
                            onPress={useCallback(() => {
                                setAmountTo(a.symbol in amountToList ? amountToList[a.symbol] : amount);
                                onNext(a);
                            }, [amountToList])}
                        />
                    ))}
        </View>
    );
};

const SwapButton = ({ assetTo, amountTo, onPress }) => {
    const { t } = useTranslation(["asset", "common", "finance"]);

    return (
        <View>
            <Button
                block={true}
                rounded={true}
                bordered={true}
                transparent={true}
                disabled={!(amountTo !== null && !amountTo.isZero())}
                onPress={onPress}
                style={preset.marginSmall}>
                <Text>
                    {amountTo
                        ? amountTo.isZero()
                            ? t("tokenConversion.notAvailable", { symbol: assetTo.symbol })
                            : t("tokenConversion.available", {
                                  symbol: assetTo.symbol,
                                  amount: formatValue(amountTo, assetTo.decimals, 2)
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
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    const ethereumBalance = getBalance(asset.ethereumAddress);
    const updateAmount = useCallback(
        newAmount => {
            setAmount(newAmount);
            if (newAmount) {
                if (asset.ethereumAddress.isZero()) {
                    const remainingEthers = ethereumBalance.sub(newAmount);

                    if (remainingEthers.eq(toBigNumber(0))) {
                        setError(t("notEnoughEthereum") + " " + t("ethRecommend"));
                        setWarning("");
                    } else if (remainingEthers.lt(toBigNumber("10000000000000000"))) {
                        setError("");
                        setWarning(t("willNotEnoughEthereum") + " " + t("ethRecommend"));
                    } else {
                        setError("");
                        setWarning("");
                    }
                }
            }
        },
        [ethereumBalance]
    );
    return (
        <View>
            <AmountInput asset={asset} max={ethereumBalance} onChangeAmount={updateAmount} style={preset.marginSmall} />
            {error.length > 0 && (
                <Text style={[preset.marginNormal, preset.colorDanger, preset.fontSize14]}>{error}</Text>
            )}
            {warning.length > 0 && (
                <Text style={[preset.marginNormal, preset.colorInfo, preset.fontSize14]}>{warning}</Text>
            )}
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
                disabled={!amount || amount.isZero() || error.length > 0}
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
    amountTo: BigNumber;
    onCancel: () => void;
    onOk: () => void;
}

const Confirm = ({ assetFrom, amount, assetTo, amountTo, onCancel, onOk }: ConfirmProps) => {
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
                    assetTo={assetTo}
                    amount={amountTo}
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
    assetTo: ERC20Asset;
    amount: BigNumber;
    onCancel: () => void;
    onOk: () => void;
}

const SwapConfirm = ({ balance, assetTo, amount, onCancel, onOk }: SwapConfirmProps) => {
    const { t } = useTranslation(["asset", "common", "finance"]);
    return (
        <>
            <Value value={balance.add(amount)} asset={assetTo} />
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

const styles = StyleSheet.create({
    border: { height: 2, backgroundColor: platform.listDividerBg }
});

export default DepositScreen;
