import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Portal } from "react-native-paper";
import Dialog from "../react-native-paper/Dialog/Dialog";

import { SavingsRecord } from "@alice-finance/alice.js/dist/contracts/MoneyMarket";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { BigNumber } from "ethers/utils";
import { Button, Card, CardItem, Left, Right, Text } from "native-base";
import { ChainContext } from "../contexts/ChainContext";
import { SavingsContext } from "../contexts/SavingsContext";
import Analytics from "../helpers/Analytics";
import useMySavingsUpdater from "../hooks/useMySavingsUpdater";
import preset from "../styles/preset";
import { formatValue } from "../utils/big-number-utils";
import SnackBar from "../utils/SnackBar";
import AgoText from "./AgoText";
import AmountInput from "./AmountInput";
import BigNumberText from "./BigNumberText";
import Row from "./Row";
import Spinner from "./Spinner";

const SavingRecordCard = ({ record }: { record: SavingsRecord }) => {
    const { t } = useTranslation("finance");
    const { asset, decimals } = useContext(SavingsContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [profit] = useState(
        record.balance
            .add(record.withdrawals.reduce((previous, current) => previous.add(current.amount), toBigNumber(0)))
            .sub(record.principal)
        // .mul(toBigNumber("100").mul(toBigNumber(10).pow(toBigNumber(decimals))))
        // .div(record.principal)
    );
    const [apr] = useState(() => {
        const multiplier = toBigNumber(10).pow(decimals);
        const rate = record.interestRate.add(multiplier);
        let value = multiplier.mul(100);
        for (let i = 0; i < 365; i++) {
            value = value.mul(rate).div(multiplier);
        }
        return value.sub(multiplier.mul(100));
    });
    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => setDialogOpen(false);
    const onWithdraw = useCallback(() => openDialog(), [record]);
    return asset ? (
        <View style={[preset.marginNormal]} key={record.id.toString()}>
            <Card>
                <CardItem>
                    <Left>
                        <Text style={[preset.marginTopSmall, preset.fontSize24, preset.fontWeightBold]}>
                            {formatValue(record.balance, asset!.decimals, 2)} {asset!.symbol}
                        </Text>
                    </Left>
                </CardItem>
                <CardItem>
                    <View style={[preset.marginLeftSmall, preset.flex1]}>
                        <Text note={true} style={preset.marginLeft0}>
                            {t("elapsed")}
                        </Text>
                        <AgoText date={record.initialTimestamp} />
                    </View>
                    <View style={[preset.marginLeftSmall, preset.flex1]}>
                        <Text note={true} style={preset.marginLeft0}>
                            {t("profit")}
                        </Text>
                        <BigNumberText value={profit} decimalPlaces={2} suffix={""} prefix={"+"} />
                    </View>
                    <View style={[preset.marginLeftSmall, preset.marginRightSmall, preset.flex0]}>
                        <Text note={true} style={preset.marginLeft0}>
                            {t("apr")}
                        </Text>
                        <BigNumberText value={apr} suffix={"%"} />
                    </View>
                </CardItem>
                <CardItem>
                    <Left />
                    <Right>
                        <Button
                            rounded={true}
                            transparent={true}
                            small={true}
                            style={preset.alignFlexEnd}
                            onPress={onWithdraw}>
                            <Text style={[{ fontSize: 16, paddingRight: 8 }, preset.colorPrimary]}>
                                {t("withdrawSavings")}
                            </Text>
                        </Button>
                    </Right>
                </CardItem>
            </Card>
            <WithdrawDialog visible={dialogOpen} apr={apr} onCancel={closeDialog} onOk={closeDialog} record={record} />
        </View>
    ) : null;
};

const WithdrawDialog = ({ visible, onCancel, onOk, record, apr }) => {
    const { t } = useTranslation(["finance", "common"]);
    const { asset, decimals, setTotalBalance } = useContext(SavingsContext);
    const { loomChain } = useContext(ChainContext);
    const [amount, setAmount] = useState<BigNumber | null>(toBigNumber(0));
    const [inProgress, setInProgress] = useState(false);
    const aprText = formatValue(apr, decimals, 2) + " %";
    const balanceText = formatValue(record.balance, asset!.decimals, 2) + " " + asset!.symbol;
    const { update } = useMySavingsUpdater();
    const onWithdraw = useCallback(async () => {
        if (loomChain && amount) {
            setInProgress(true);
            try {
                const market = loomChain.getMoneyMarket();
                const tx = await market.withdraw(record.id, amount);
                await tx.wait();
                setTotalBalance(toBigNumber(await market.totalFunds()));
                await update();
                SnackBar.success(t("withdrawalComplete"));
                Analytics.track(Analytics.events.SAVINGS_WITHDRAWN);
                onOk();
            } catch (e) {
                SnackBar.danger(e.message);
            } finally {
                setInProgress(false);
            }
        }
    }, [loomChain, amount]);
    return (
        <Portal>
            <Dialog dismissable={false} visible={visible} onDismiss={onCancel}>
                <Dialog.Content>
                    <Text style={[preset.fontWeightBold, preset.fontSize20, preset.marginBottomSmall]}>
                        {t("withdrawSavings")}
                    </Text>
                    <Text style={[preset.fontSize14, preset.colorDarkGrey, preset.marginBottomSmall]}>
                        {t("withdrawSavings.description")}
                    </Text>
                    <AmountInput
                        asset={asset!}
                        max={record.balance}
                        disabled={!amount || inProgress}
                        onChangeAmount={setAmount}
                        style={preset.marginTopNormal}
                    />
                    <View style={[preset.marginSmall, preset.marginTopNormal]}>
                        <Row label={t("apr")} value={aprText} />
                        <Row label={t("myBalance")} value={balanceText} />
                    </View>
                    {inProgress && <Spinner compact={true} />}
                </Dialog.Content>
                <Dialog.Actions>
                    <Button rounded={true} transparent={true} onPress={onCancel} disabled={inProgress}>
                        <Text>{t("common:cancel")}</Text>
                    </Button>
                    {/* tslint:disable-next-line:jsx-no-lambda */}
                    <Button rounded={true} transparent={true} onPress={onWithdraw} disabled={!amount || inProgress}>
                        <Text>{t("withdrawSavings")}</Text>
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default SavingRecordCard;
