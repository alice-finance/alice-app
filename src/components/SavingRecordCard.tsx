import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Portal } from "react-native-paper";
import Dialog from "../react-native-paper/Dialog/Dialog";

import { SavingsRecord } from "@alice-finance/alice.js/dist/contracts/MoneyMarket";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { BigNumber } from "ethers/utils";
import { Button, Card, CardItem, Icon, Left, Spinner as NativeSpinner, Text } from "native-base";
import { ChainContext } from "../contexts/ChainContext";
import { SavingsContext } from "../contexts/SavingsContext";
import Analytics from "../helpers/Analytics";
import useAliceClaimer from "../hooks/useAliceClaimer";
import useMySavingsUpdater from "../hooks/useMySavingsUpdater";
import preset from "../styles/preset";
import { formatValue } from "../utils/big-number-utils";
import SnackBar from "../utils/SnackBar";
import AmountInput from "./AmountInput";
import BigNumberText from "./BigNumberText";
import MomentText from "./MomentText";
import Row from "./Row";
import Spinner from "./Spinner";

const IFO_STARTED_AT = new Date(2019, 7, 15);

const SavingRecordCard = ({ record }: { record: SavingsRecord }) => {
    const { decimals } = useContext(SavingsContext);
    const ifoStarted = new Date() >= IFO_STARTED_AT;
    const [apr] = useState(() => {
        const multiplier = toBigNumber(10).pow(decimals);
        const rate = record.interestRate.add(multiplier);
        let value = multiplier.mul(100);
        for (let i = 0; i < 365; i++) {
            value = value.mul(rate).div(multiplier);
        }
        return value.sub(multiplier.mul(100));
    });
    return (
        <View style={[preset.marginNormal]} key={record.id.toString()}>
            <Card>
                <Header record={record} ifoStarted={ifoStarted} />
                <Body record={record} apr={apr} />
                <Actions record={record} apr={apr} />
            </Card>
        </View>
    );
};

const Header = ({ record, ifoStarted }) => {
    const { asset } = useContext(SavingsContext);
    const { claimableAt, claimableAmount, claim, claiming } = useAliceClaimer(record);
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
                    {ifoStarted && (
                        <ClaimText claimableAt={claimableAt} claimableAmount={claimableAmount} claimable={claimable} />
                    )}
                </View>
                {ifoStarted && <ClaimButton claimable={claimable} claim={claim} claiming={claiming} />}
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
        }
    }, []);
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
                    {t("profit")}
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

const WithdrawButton = ({ record, onOk, amount, inProgress, setInProgress }) => {
    const { t } = useTranslation(["finance", "common"]);
    const { loomChain } = useContext(ChainContext);
    const { update } = useMySavingsUpdater();
    const { setTotalBalance } = useContext(SavingsContext);
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
        <Button rounded={true} transparent={true} onPress={onWithdraw} disabled={!amount || inProgress}>
            <Text>{t("withdrawSavings")}</Text>
        </Button>
    );
};

export default SavingRecordCard;
