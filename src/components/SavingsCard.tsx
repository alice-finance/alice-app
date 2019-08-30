import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { Body, Button, Card, CardItem, Left, Text } from "native-base";
import TokenIcon from "../components/TokenIcon";
import { ChainContext } from "../contexts/ChainContext";
import { SavingsContext } from "../contexts/SavingsContext";
import useAssetBalancesUpdater from "../hooks/useAssetBalancesUpdater";
import useAsyncEffect from "../hooks/useAsyncEffect";
import preset from "../styles/preset";
import { formatValue } from "../utils/big-number-utils";
import Sentry from "../utils/Sentry";
import BigNumberText from "./BigNumberText";

const SavingsCard = () => {
    const { t } = useTranslation("finance");
    const { isReadOnly } = useContext(ChainContext);
    const { asset, totalBalance, myTotalBalance, apr } = useContext(SavingsContext);
    const { updating, update } = useAssetBalancesUpdater();
    const refreshing = !asset || !totalBalance || updating;
    useAsyncEffect(update, []);
    return (
        <View style={[preset.marginNormal]}>
            <Card>
                <CardItem>
                    <Left>
                        <TokenIcon address={asset!.ethereumAddress.toLocalAddressString()} width={56} height={56} />
                        <Body style={preset.marginLeftNormal}>
                            <Text style={[preset.fontSize24, preset.fontWeightBold]}>{asset!.name}</Text>
                            <MySavingsSummaryText />
                        </Body>
                    </Left>
                </CardItem>
                <CardItem style={preset.marginRightSmall}>
                    <Column label={t("totalBalance")} value={totalBalance} />
                    {!isReadOnly && <Column label={t("mySavings")} value={myTotalBalance} />}
                    <Column label={t("apr")} value={apr} small={!isReadOnly} />
                </CardItem>
                <Footer refreshing={refreshing} />
            </Card>
        </View>
    );
};

const Column = ({ label, value, small = false }) => (
    <View style={[preset.marginLeftSmall, small ? preset.flex0 : preset.flex1]}>
        <Text note={true} style={preset.marginLeft0}>
            {label}
        </Text>
        <BigNumberText value={value} decimalPlaces={small ? 2 : 4} />
    </View>
);

const Footer = ({ refreshing }) => {
    return (
        <CardItem style={preset.marginBottomSmall}>
            <Body style={preset.alignItemsFlexEnd}>
                <View style={preset.flexDirectionRow}>
                    <LeaderboardButton />
                    <StartSavingButton refreshing={refreshing} />
                </View>
            </Body>
        </CardItem>
    );
};

const LeaderboardButton = () => {
    const { t } = useTranslation("finance");
    const { push } = useNavigation();
    const onShowLeaderboard = useCallback(() => {
        Sentry.track(Sentry.trackingTopics.LEADERBOARD);
        push("SavingsLeaderboard");
    }, []);
    return (
        <Button primary={true} bordered={true} rounded={true} onPress={onShowLeaderboard}>
            <Text style={preset.fontSize16}>{t("leaderboard")}</Text>
        </Button>
    );
};

const StartSavingButton = ({ refreshing }) => {
    const { t } = useTranslation("finance");
    const { push } = useNavigation();
    const { isReadOnly } = useContext(ChainContext);
    const onStart = useCallback(() => {
        Sentry.track(Sentry.trackingTopics.START_SAVING);
        push(isReadOnly ? "Start" : "NewSavings");
    }, []);
    return (
        <Button primary={true} rounded={true} disabled={refreshing} onPress={onStart} style={preset.marginLeftSmall}>
            <Text style={preset.fontSize16}>{t("startSaving")}</Text>
        </Button>
    );
};

const MySavingsSummaryText = () => {
    const { t } = useTranslation("finance");
    const { myTotalPrincipal, myTotalBalance, myTotalWithdrawal } = useContext(SavingsContext);
    let profit = toBigNumber(0);
    if (myTotalPrincipal && myTotalBalance && myTotalWithdrawal && !myTotalPrincipal.isZero()) {
        profit = myTotalBalance.add(myTotalWithdrawal).sub(myTotalPrincipal);
    }
    const text = myTotalPrincipal && !myTotalPrincipal.isZero() ? "$" + formatValue(profit, 18) : t("startSavingsNow");
    return <Text style={profit.isZero() ? preset.colorGrey : preset.colorInfo}>{text}</Text>;
};

export default SavingsCard;
