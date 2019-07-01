import React, { useCallback, useContext, useState } from "react";
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
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/big-number-utils";

const DepositScreen = () => {
    const { t } = useTranslation(["asset"]);
    const { pop, getParam } = useNavigation();
    const { getPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const [amount, setAmount] = useState<BigNumber | null>(null);
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
    const [inProgress, setInProgress] = useState(false);
    const onCancel = useCallback(() => {
        setAmount(null);
        setSelectedSymbol(null);
    }, []);
    const onOk = useCallback(async () => {
        setInProgress(true);
        try {
            if (asset.ethereumAddress.isZero()) {
                await depositETH(amount!);
            } else {
                await depositERC20(amount!);
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
    }, [amount]);

    const asset: ERC20Asset = getParam("asset");
    const { deposit: depositETH } = useETHDepositor();
    const { deposit: depositERC20 } = useERC20Depositor(asset);
    const pendingDepositTransactions = getPendingDepositTransactions(asset.ethereumAddress);
    return (
        <Container>
            <Content>
                <TitleText aboveText={true}>{t("deposit")}</TitleText>
                <CaptionText>{t("deposit.description")}</CaptionText>
                <View style={[preset.marginNormal, preset.marginTopLarge]}>
                    {inProgress || pendingDepositTransactions.length > 0 ? (
                        <DepositInProgress asset={asset} />
                    ) : selectedSymbol ? (
                        <Confirm asset={asset} amount={amount!} onCancel={onCancel} onOk={onOk} />
                    ) : amount ? (
                        <ConversionControls asset={asset} onNext={setSelectedSymbol} />
                    ) : (
                        <AmountControls asset={asset} onNext={setAmount} />
                    )}
                </View>
            </Content>
        </Container>
    );
};

interface ConversionControlsProps {
    asset: ERC20Asset;
    onNext: (symbol: string) => void;
}

const ConversionControls = ({ asset, onNext }: ConversionControlsProps) => {
    const { t } = useTranslation(["asset", "common"]);
    const { assets } = useContext(AssetContext);
    return (
        <View>
            <HeadlineText aboveText={true}>{t("tokenConversion")}</HeadlineText>
            <CaptionText small={true}>{t("tokenConversion.description")}</CaptionText>
            <Button
                block={true}
                rounded={true}
                onPress={useCallback(() => onNext(asset.symbol), [])}
                style={[preset.marginSmall, preset.marginTopLarge]}>
                <Text>{t("tokenConversion.no", { symbol: asset.symbol })}</Text>
            </Button>
            {assets
                .filter(a => a.symbol !== asset.symbol)
                .map((a, key) => (
                    <Button
                        key={key}
                        block={true}
                        rounded={true}
                        bordered={true}
                        transparent={true}
                        onPress={useCallback(() => onNext(a.symbol), [])}
                        style={preset.marginSmall}>
                        <Text>{a.symbol}</Text>
                    </Button>
                ))}
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
    asset: ERC20Asset;
    amount: BigNumber;
    onCancel: () => void;
    onOk: () => void;
}

const Confirm = ({ asset, amount, onCancel, onOk }: ConfirmProps) => {
    const { t } = useTranslation(["asset"]);
    const { getBalance } = useContext(BalancesContext);
    const loomBalance = getBalance(asset.loomAddress);
    const newLoomBalance = amount ? loomBalance.add(amount) : loomBalance;
    return (
        <View style={preset.marginNormal}>
            <Text>{t("wouldYouChangeTheDepositAmount")}</Text>
            <View style={[preset.marginTopNormal, preset.marginBottomNormal, styles.border]} />
            <Value value={loomBalance} asset={asset} />
            <Icon
                type="SimpleLineIcons"
                name="arrow-down-circle"
                style={[preset.marginSmall, preset.alignCenter, preset.colorGrey]}
            />
            <Value value={newLoomBalance} asset={asset} />
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
        </View>
    );
};

const Value = ({ asset, value }: { asset: ERC20Asset; value: BigNumber }) => (
    <Text style={[preset.fontSize36, preset.textAlignCenter, preset.paddingSmall, preset.flex1]}>
        {formatValue(value, asset.decimals, 2) + " " + asset.symbol}
    </Text>
);

const styles = StyleSheet.create({
    border: { height: 2, backgroundColor: platform.listDividerBg }
});

export default DepositScreen;
