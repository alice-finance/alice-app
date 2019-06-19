import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Dialog, Portal } from "react-native-paper";

import { BigNumber } from "ethers/utils";
import { Button, Card, CardItem, Left, Right, Text, Toast } from "native-base";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { SavingsContext } from "../contexts/SavingsContext";
import SavingsRecord from "../evm/SavingsRecord";
import useMySavingsUpdater from "../hooks/useMySavingsUpdater";
import preset from "../styles/preset";
import { formatValue, toBigNumber } from "../utils/big-number-utils";
import AmountInput from "./AmountInput";
import BigNumberText from "./BigNumberText";
import Spinner from "./Spinner";

const SavingRecordCard = ({ record }: { record: SavingsRecord }) => {
    const { t } = useTranslation("finance");
    const { asset, apr } = useContext(SavingsContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [profit] = useState(
        record.balance
            .add(record.withdrawals.reduce((previous, current) => previous.add(current.amount), toBigNumber(0)))
            .sub(record.principal)
            .mul(toBigNumber(10000))
            .div(record.principal)
    );
    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => setDialogOpen(false);
    const onWithdraw = useCallback(() => openDialog(), [record]);
    return (
        <View style={[preset.marginNormal]}>
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
                            {t("startedOn")}
                        </Text>
                        <Text style={preset.fontSize20}>
                            {record.initialTimestamp.getMonth() + 1 + "/" + record.initialTimestamp.getDate()}
                        </Text>
                    </View>
                    <View style={[preset.marginLeftSmall, preset.flex1]}>
                        <Text note={true} style={preset.marginLeft0}>
                            {t("profit")}
                        </Text>
                        <BigNumberText value={profit} suffix={"%"} />
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
            <WithdrawDialog visible={dialogOpen} onCancel={closeDialog} onOk={closeDialog} record={record} />
        </View>
    );
};

const WithdrawDialog = ({ visible, onCancel, onOk, record }) => {
    const { t } = useTranslation(["finance", "common"]);
    const { asset, decimals, apr } = useContext(SavingsContext);
    const { loomConnector } = useContext(ConnectorContext);
    const [amount, setAmount] = useState<BigNumber | null>(toBigNumber(0));
    const [inProgress, setInProgress] = useState(false);
    const aprText = apr ? formatValue(apr, decimals, 2) + " %" : t("inquiring");
    const balanceText = formatValue(record.balance, asset!.decimals, 2) + " " + asset!.symbol;
    const { update } = useMySavingsUpdater();
    const onWithdraw = useCallback(async () => {
        if (loomConnector && amount) {
            setInProgress(true);
            try {
                const market = loomConnector.getMoneyMarket();
                const tx = await market.withdraw(record.id, amount, { gasLimit: 0 });
                await tx.wait();
                await update();
                Toast.show({ text: t("withdrawalComplete") });
                onOk();
            } finally {
                setInProgress(false);
            }
        }
    }, [loomConnector, amount]);
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onCancel}>
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

const Row = ({ label, value }) => (
    <View style={[preset.flexDirectionRow, preset.marginTopTiny, preset.marginBottomTiny]}>
        <Text style={[preset.flex0, preset.colorGrey, preset.fontSize14]}>{label}</Text>
        <Text style={[preset.flex1, preset.textAlignRight, preset.fontSize14]}>{value}</Text>
    </View>
);

export default SavingRecordCard;
