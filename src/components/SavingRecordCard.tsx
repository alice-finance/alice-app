import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { Portal } from "react-native-paper";
import Dialog from "../react-native-paper/Dialog/Dialog";

import { SavingsRecord } from "@alice-finance/alice.js/dist/contracts/MoneyMarket";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { BigNumber } from "ethers/utils";
import { Button, Card, CardItem, Icon, Left, Spinner as NativeSpinner, Text } from "native-base";
import { ChainContext } from "../contexts/ChainContext";
import { SavingsContext } from "../contexts/SavingsContext";
import useAliceClaimer from "../hooks/useAliceClaimer";
import useMySavingsLoader from "../hooks/useMySavingsLoader";
import preset from "../styles/preset";
import { formatValue } from "../utils/big-number-utils";
import { compoundToAPR } from "../utils/interest-rate-utils";
import Sentry from "../utils/Sentry";
import SnackBar from "../utils/SnackBar";
import AmountInput from "./AmountInput";
import BigNumberText from "./BigNumberText";
import MomentText from "./MomentText";
import Row from "./Row";
import Spinner from "./Spinner";

const SavingRecordCard = ({ record }: { record: SavingsRecord }) => {
    const { decimals } = useContext(SavingsContext);
    const { claimableAt, claimableAmount, claim, claiming } = useAliceClaimer(record);
    const [apr] = useState(() => compoundToAPR(record.interestRate, decimals));
    return (
        <View style={[preset.marginNormal]} key={record.id.toString()}>
            <Card>
                <Header
                    record={record}
                    claimableAt={claimableAt}
                    claimableAmount={claimableAmount}
                    claim={claim}
                    claiming={claiming}
                />
                <Body record={record} apr={apr} />
                <Actions record={record} apr={apr} />
            </Card>
        </View>
    );
};

const Header = ({ record, claimableAt, claimableAmount, claim, claiming }) => {
    const { asset } = useContext(SavingsContext);
    const [claimable, setClaimable] = useState(claimableAt && claimableAt.getTime() <= Date.now());
    useEffect(() => {
        setClaimable(claimableAt && claimableAt.getTime() <= Date.now());
        let handle = 0;
        if (claimableAt) {
            handle = setTimeout(() => setClaimable(true), claimableAt.getTime() - Date.now());
        }
        return () => clearTimeout(handle);
    }, [claimableAt]);
    return (
        <CardItem>
            <View style={preset.flexDirectionRow}>
                <View style={[preset.flex1, preset.marginSmall]}>
                    <Text style={[preset.fontSize24, preset.fontWeightBold]}>
                        {formatValue(record.balance, asset!.decimals)} {asset!.symbol}
                    </Text>
                    <ClaimText claimableAt={claimableAt} claimableAmount={claimableAmount} claimable={claimable} />
                </View>
                <ClaimButton claimable={claimable} claim={claim} claiming={claiming} />
            </View>
        </CardItem>
    );
};

const ClaimText = ({ claimableAt, claimableAmount, claimable }) => {
    const { t } = useTranslation("finance");
    const { decimals } = useContext(SavingsContext);
    const text = claimableAt ? (claimable ? "youCanClaimNow" : "youCanClaim") : "calculatingClaim";
    const amount = claimableAmount ? formatValue(claimableAmount, decimals) : "";
    return (
        <View style={preset.flexDirectionRow}>
            <Text note={true}>{t(text, { amount })}</Text>
            {claimableAt && !claimable && <MomentText date={claimableAt} note={true} />}
        </View>
    );
};

const ClaimButton = ({ claimable, claim, claiming }) => {
    const { t } = useTranslation("finance");
    const onClaim = useCallback(async () => {
        try {
            await claim();
            SnackBar.success(t("claimedAlice"));
        } catch (e) {
            SnackBar.danger(e.message);
            Sentry.error(e);
        }
    }, [claim]);
    return claiming ? (
        <NativeSpinner size={"small"} style={[preset.marginRightNormal, { marginBottom: -16 }]} />
    ) : (
        <Button
            info={true}
            rounded={true}
            transparent={true}
            disabled={!claimable}
            onPress={onClaim}
            style={preset.marginTopNormal}>
            <View style={[preset.flexDirectionColumn, preset.alignItemsCenter]}>
                <Icon type={"AntDesign"} name={"gift"} />
                <Text style={preset.fontSize12}>{t("claimAlice")}</Text>
            </View>
        </Button>
    );
};

const Body = ({ record, apr }: { record: SavingsRecord; apr: BigNumber }) => {
    const { t } = useTranslation("finance");
    const [profit] = useState(
        record.balance
            .add(record.withdrawals.reduce((previous, current) => previous.add(current.amount), toBigNumber(0)))
            .sub(record.principal)
        // .mul(toBigNumber("100").mul(toBigNumber(10).pow(toBigNumber(decimals))))
        // .div(record.principal)
    );
    return (
        <CardItem>
            <View style={[preset.marginLeftSmall, preset.flex2]}>
                <Text note={true} style={preset.marginLeft0}>
                    {t("elapsed")}
                </Text>
                <MomentText date={record.initialTimestamp} ago={true} />
            </View>
            <View style={[preset.marginLeftSmall, preset.flex3]}>
                <Text note={true} style={preset.marginLeft0}>
                    {t("interestEarned")}
                </Text>
                <BigNumberText value={profit} suffix={""} prefix={"$"} />
            </View>
            <View style={[preset.marginLeftSmall, preset.marginRightSmall, preset.flex2]}>
                <Text note={true} style={preset.marginLeft0}>
                    {t("apr")}
                </Text>
                <BigNumberText value={apr} suffix={"%"} decimalPlaces={2} />
            </View>
        </CardItem>
    );
};

const Actions = ({ record, apr }) => {
    const { t } = useTranslation("finance");
    const [dialogOpen, setDialogOpen] = useState(false);
    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => setDialogOpen(false);
    return (
        <View style={preset.marginBottomTiny}>
            <CardItem>
                <Left />
                <Button primary={true} rounded={true} transparent={true} small={true} onPress={openDialog}>
                    <Text style={{ paddingRight: 12 }}>{t("withdrawSavings")}</Text>
                </Button>
            </CardItem>
            <WithdrawDialog visible={dialogOpen} apr={apr} onCancel={closeDialog} onOk={closeDialog} record={record} />
        </View>
    );
};

const WithdrawDialog = ({ visible, onCancel, onOk, record, apr }) => {
    const { t } = useTranslation("common");
    const [amount, setAmount] = useState<BigNumber | null>(toBigNumber(0));
    const [inProgress, setInProgress] = useState(false);
    return (
        <Portal>
            <Dialog dismissable={false} visible={visible} onDismiss={onCancel}>
                <Dialog.Content>
                    <DialogContent record={record} apr={apr} onChangeAmount={setAmount} inProgress={inProgress} />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button rounded={true} transparent={true} onPress={onCancel} disabled={inProgress}>
                        <Text>{t("cancel")}</Text>
                    </Button>
                    <WithdrawButton
                        record={record}
                        onOk={onOk}
                        amount={amount}
                        inProgress={inProgress}
                        setInProgress={setInProgress}
                    />
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const DialogContent = ({ record, apr, onChangeAmount, inProgress }) => {
    const { t } = useTranslation("finance");
    const { asset, decimals } = useContext(SavingsContext);
    return (
        <>
            <Text style={[preset.fontWeightBold, preset.fontSize20, preset.marginBottomSmall]}>
                {t("withdrawSavings")}
            </Text>
            <Text style={[preset.fontSize14, preset.colorDarkGrey, preset.marginBottomSmall]}>
                {t("withdrawSavings.description")}
            </Text>
            <AmountInput
                asset={asset!}
                max={record.balance}
                disabled={inProgress}
                onChangeAmount={onChangeAmount}
                style={preset.marginTopNormal}
            />
            <View style={[preset.marginSmall, preset.marginTopNormal]}>
                <Row label={t("apr")} value={formatValue(apr, decimals, 2) + " %"} />
                <Row
                    label={t("myBalance")}
                    value={formatValue(record.balance, asset!.decimals) + " " + asset!.symbol}
                />
            </View>
            {inProgress && <Spinner compact={true} />}
        </>
    );
};

const useWithdraw = () => {
    const { loomChain } = useContext(ChainContext);
    const { setTotalBalance } = useContext(SavingsContext);
    const { load } = useMySavingsLoader();

    const withdraw = useCallback(
        async (record, amount) => {
            if (loomChain) {
                const market = loomChain.getMoneyMarket();
                const tx = await market.withdraw(record.id, amount);
                await tx.wait();
                Sentry.track(Sentry.trackingTopics.SAVINGS_WITHDRAWN, {
                    recordId: record.id.toNumber(),
                    tx: tx.hash,
                    amount: amount.toString()
                });
                setTotalBalance(toBigNumber(await market.totalFunds()));
                await load();
                return true;
            }
            return false;
        },
        [loomChain]
    );

    return { withdraw };
};

const WithdrawButton = ({ record, onOk, amount, inProgress, setInProgress }) => {
    const { t } = useTranslation(["finance", "common"]);
    const { withdraw } = useWithdraw();
    const onWithdraw = useCallback(async () => {
        if (amount) {
            setInProgress(true);
            try {
                await withdraw(record, amount);
                SnackBar.success(t("withdrawalComplete"));
                onOk();
            } catch (e) {
                SnackBar.danger(e.message);
                Sentry.error(e);
            } finally {
                setInProgress(false);
            }
        }
    }, [withdraw, amount]);
    const onPress = useCallback(() => {
        Alert.alert(t("withdrawSavings.confirm"), undefined, [
            { text: t("common:cancel"), style: "cancel" },
            { text: t("common:ok"), onPress: onWithdraw }
        ]);
    }, [onWithdraw]);
    return (
        <Button rounded={true} transparent={true} onPress={onPress} disabled={!amount || inProgress}>
            <Text>{t("withdrawSavings")}</Text>
        </Button>
    );
};

export default SavingRecordCard;
