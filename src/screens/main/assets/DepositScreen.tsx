import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { BigNumber } from "ethers/utils";
import { Button, Container, Content, Icon, Text } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import AmountInput from "../../../components/AmountInput";
import CaptionText from "../../../components/CaptionText";
import DepositInProgress from "../../../components/DepositInProgress";
import TitleText from "../../../components/TitleText";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { PendingTransactionsContext } from "../../../contexts/PendingTransactionsContext";
import ERC20Token from "../../../evm/ERC20Token";
import useERC20Depositor from "../../../hooks/useERC20Depositor";
import useETHDepositor from "../../../hooks/useETHDepositor";
import preset from "../../../styles/preset";
import { formatValue, toBigNumber } from "../../../utils/big-number-utils";

const DepositScreen = () => {
    const { t } = useTranslation(["asset"]);
    const { pop, getParam } = useNavigation();
    const { getBalance } = useContext(BalancesContext);
    const { getPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const [amount, setAmount] = useState<BigNumber | null>(toBigNumber(0));
    const [change, setChange] = useState<BigNumber | null>(null);
    const [inProgress, setInProgress] = useState(false);
    const onPressDeposit = useCallback(() => setChange(amount), [amount]);
    const onCancel = useCallback(() => {
        setAmount(null);
        setChange(null);
    }, []);
    const onOk = useCallback(async () => {
        setInProgress(true);
        try {
            if (asset.ethereumAddress.isNull()) {
                await depositETH(change!);
            } else {
                await depositERC20(change!);
            }
            pop();
        } finally {
            setAmount(null);
            setChange(null);
            setInProgress(false);
        }
    }, [change]);

    const asset: ERC20Token = getParam("asset");
    const { deposit: depositETH } = useETHDepositor();
    const { deposit: depositERC20 } = useERC20Depositor(asset);
    const ethereumBalance = getBalance(asset.ethereumAddress);
    const pendingDepositTransactions = getPendingDepositTransactions(asset.ethereumAddress);
    return (
        <Container>
            <Content>
                <TitleText aboveText={true}>{t("deposit")}</TitleText>
                <CaptionText>{t("deposit.description")}</CaptionText>
                <View style={[preset.marginNormal, preset.marginTopLarge]}>
                    {inProgress || pendingDepositTransactions.length > 0 ? (
                        <DepositInProgress asset={asset} />
                    ) : change ? (
                        <Confirm asset={asset} change={change} onCancel={onCancel} onOk={onOk} />
                    ) : (
                        <>
                            <AmountInput
                                asset={asset}
                                max={ethereumBalance}
                                disabled={!!change}
                                onChangeAmount={setAmount}
                                style={preset.marginSmall}
                            />
                            <Button
                                primary={true}
                                rounded={true}
                                block={true}
                                disabled={!amount || amount.isZero()}
                                style={preset.marginTopNormal}
                                onPress={onPressDeposit}>
                                <Text>{t("deposit")}</Text>
                            </Button>
                        </>
                    )}
                </View>
            </Content>
        </Container>
    );
};

interface ConfirmProps {
    asset: ERC20Token;
    change: BigNumber;
    onCancel: () => void;
    onOk: () => void;
}

const Confirm = ({ asset, change, onCancel, onOk }: ConfirmProps) => {
    const { t } = useTranslation(["asset"]);
    const { getBalance } = useContext(BalancesContext);
    const loomBalance = getBalance(asset.loomAddress);
    const newLoomBalance = change ? loomBalance.add(change) : loomBalance;
    return (
        <View style={preset.marginNormal}>
            <Text>{t("wouldYouChangeTheDepositAmount")}</Text>
            <View style={[preset.marginTopNormal, preset.marginBottomNormal, styles.border]} />
            <Value value={loomBalance} asset={asset} style={preset.flex1} />
            <Icon
                type="SimpleLineIcons"
                name="arrow-down-circle"
                style={[preset.marginSmall, preset.alignCenter, preset.colorGrey]}
            />
            <Value value={newLoomBalance} asset={asset} style={preset.flex1} />
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

const Value = ({ asset, value, style = {} }) => (
    <Text style={[preset.fontSize36, preset.textAlignCenter, preset.paddingSmall, style]}>
        {formatValue(value, asset.decimals, 2) + " " + asset.symbol}
    </Text>
);

const styles = StyleSheet.create({
    border: { height: 2, backgroundColor: platform.listDividerBg }
});

export default DepositScreen;