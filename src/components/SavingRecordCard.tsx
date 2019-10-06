import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { Portal } from "react-native-paper";
import Dialog from "../react-native-paper/Dialog/Dialog";

import { SavingsRecord } from "@alice-finance/alice.js/dist/contracts/MoneyMarket";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { BigNumber } from "ethers/utils";
import { Body, Button, Card, CardItem, Icon, Left, Spinner as NativeSpinner, Text } from "native-base";
import { ChainContext } from "../contexts/ChainContext";
import { SavingsContext } from "../contexts/SavingsContext";
import useAliceClaimer from "../hooks/useAliceClaimer";
import useAsyncEffect from "../hooks/useAsyncEffect";
import useMySavingsLoader from "../hooks/useMySavingsLoader";
import preset from "../styles/preset";
import { formatValue } from "../utils/big-number-utils";
import { fetchCollection } from "../utils/firebase-utils";
import { compoundToAPR } from "../utils/interest-rate-utils";
import Sentry from "../utils/Sentry";
import SnackBar from "../utils/SnackBar";
import AmountInput from "./AmountInput";
import BigNumberText from "./BigNumberText";
import MomentText from "./MomentText";
import NoteText from "./NoteText";
import Row from "./Row";
import Spinner from "./Spinner";
import TokenIcon from "./TokenIcon";

const SavingRecordCard = ({ record }: { record: SavingsRecord }) => {
    const { asset, decimals } = useContext(SavingsContext);
    const [apr] = useState(() => compoundToAPR(record.interestRate, decimals));
    return (
        <View style={[preset.marginNormal]} key={record.id.toString()}>
            <Card>
                <Header asset={asset} apr={apr} record={record} />
                <Main asset={asset} record={record} />
                <Notes record={record} apr={apr} />
                <Footer record={record} decimals={decimals} />
            </Card>
        </View>
    );
};

const Header = ({ asset, apr, record }) => {
    const { t } = useTranslation("finance");
    const [dialogOpen, setDialogOpen] = useState(false);
    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => setDialogOpen(false);
    return (
        <>
            <CardItem>
                <Left>
                    <TokenIcon address={asset!.ethereumAddress.toLocalAddressString()} width={32} height={32} />
                    <Body style={preset.marginLeftNormal}>
                        <Text style={[preset.fontSize20, preset.colorGrey]}>{asset!.name}</Text>
                    </Body>
                </Left>
                <Button primary={true} rounded={true} transparent={true} small={true} onPress={openDialog}>
                    <Text style={{ paddingRight: 12 }}>{t("withdrawSavings")}</Text>
                </Button>
            </CardItem>
            <WithdrawDialog visible={dialogOpen} apr={apr} onCancel={closeDialog} onOk={closeDialog} record={record} />
        </>
    );
};

const Main = ({ asset, record }) => {
    const { t } = useTranslation("finance");
    const [profit] = useState(
        record.balance
            .add(record.withdrawals.reduce((previous, current) => previous.add(current.amount), toBigNumber(0)))
            .sub(record.principal)
    );
    const { claimedAmount } = useClaimedAmountUpdater(record);
    const assetSuffix = " " + asset!.symbol;
    return (
        <>
            <CardItem>
                <View style={preset.flexDirectionRow}>
                    <View style={[preset.flex1, preset.alignItemsFlexEnd]}>
                        <Text style={preset.fontSize20}>{t("myBalance")}</Text>
                        <Text style={preset.fontSize20}>{t("interestEarned")}</Text>
                        <Text style={preset.fontSize20}>{t("claimedRewards")}</Text>
                    </View>
                    <View style={[preset.flex2, preset.alignItemsCenter]}>
                        <BigNumberText value={record.balance} suffix={assetSuffix} style={preset.fontWeightBold} />
                        <BigNumberText value={profit} suffix={assetSuffix} style={preset.fontWeightBold} />
                        <BigNumberText value={claimedAmount} suffix={" ALICE"} style={preset.fontWeightBold} />
                    </View>
                </View>
            </CardItem>
        </>
    );
};

const Notes = ({ apr, record }) => {
    const { t } = useTranslation("finance");
    return (
        <View style={[preset.alignFlexEnd, preset.flexDirectionRow, preset.marginLeftNormal, preset.marginRightNormal]}>
            <MomentText date={record.initialTimestamp} note={true} />
            <NoteText> / {t("apr")} </NoteText>
            <BigNumberText value={apr} suffix={"%"} decimalPlaces={2} style={[preset.fontSize14, preset.colorGrey]} />
        </View>
    );
};

const Footer = ({ record, decimals }) => {
    const { claim, claiming, claimableAt, claimableAmount } = useAliceClaimer(record);
    const [claimable, setClaimable] = useState(claimableAt && claimableAt.getTime() <= Date.now());
    const amount = claimableAmount ? formatValue(claimableAmount, decimals) : "";
    useEffect(() => {
        setClaimable(claimableAt && claimableAt.getTime() <= Date.now());
        let handle = 0;
        if (claimableAt) {
            handle = setTimeout(() => setClaimable(true), claimableAt.getTime() - Date.now());
        }
        return () => clearTimeout(handle);
    }, [claimableAt]);
    return claiming ? (
        <NativeSpinner size={"small"} style={[preset.marginRightNormal]} />
    ) : claimable ? (
        <View style={preset.marginNormal}>
            <ClaimButton claim={claim} amount={amount} />
        </View>
    ) : (
        <View style={preset.marginNormal}>
            <DisabledClaimButton claimableAt={claimableAt} />
        </View>
    );
};

const ClaimButton = ({ claim, amount }) => {
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
    return (
        <Button primary={true} rounded={true} bordered={true} block={true} onPress={onClaim} iconLeft={true}>
            <Icon type={"AntDesign"} name={"gift"} />
            <Text>{t("claimAlice", { amount })}</Text>
        </Button>
    );
};

const DisabledClaimButton = ({ claimableAt }) => {
    const { t } = useTranslation("finance");
    return (
        <Button primary={true} rounded={true} bordered={true} block={true} disabled={true} iconLeft={true}>
            <Icon type={"MaterialCommunityIcons"} name={"clock-outline"} style={{ color: "grey" }} />
            <View style={preset.flexDirectionRow}>
                <NoteText style={{ paddingRight: 0 }}>{t("youCanClaim")}</NoteText>
                {claimableAt ? (
                    <MomentText date={claimableAt} ago={true} note={true} />
                ) : (
                    <NoteText>{t("loading")}</NoteText>
                )}
            </View>
        </Button>
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
        Alert.alert(t("common:warning"), t("withdrawSavings.confirm"), [
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

const useClaimedAmountUpdater = (record: SavingsRecord) => {
    const [claimedAmount, setClaimedAmount] = useState(toBigNumber(0));
    useAsyncEffect(async () => {
        const claims = await fetchCollection(ref =>
            ref
                .doc("events")
                .collection("Claimed")
                .where("recordId", "==", record.id.toNumber())
        );
        setClaimedAmount(
            claims.reduce<BigNumber>((previous, current) => previous.add(toBigNumber(current.amount)), toBigNumber(0))
        );
    }, [record.balance]);
    return { claimedAmount };
};

export default SavingRecordCard;
