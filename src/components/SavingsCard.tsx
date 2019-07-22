import React, { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { Body, Button, Card, CardItem, Left, Right, Text } from "native-base";
import TokenIcon from "../components/TokenIcon";
import { SavingsContext } from "../contexts/SavingsContext";
import useTokenBalanceUpdater from "../hooks/useTokenBalanceUpdater";
import preset from "../styles/preset";
import { formatValue } from "../utils/big-number-utils";
import BigNumberText from "./BigNumberText";

const SavingsCard = () => {
    const { t } = useTranslation("finance");
    const { push } = useNavigation();
    const { asset, totalBalance, myTotalBalance, apr } = useContext(SavingsContext);
    const onPress = useCallback(() => push("NewSavings"), []);
    const { updating, update } = useTokenBalanceUpdater();
    const refreshing = !asset || !totalBalance || updating;
    useEffect(() => {
        update();
    }, []);
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
                <CardItem>
                    <View style={[preset.marginLeftSmall, preset.flex1]}>
                        <Text note={true} style={preset.marginLeft0}>
                            {t("totalBalance")}
                        </Text>
                        <BigNumberText value={totalBalance} />
                    </View>
                    <View style={[preset.marginLeftSmall, preset.flex1]}>
                        <Text note={true} style={preset.marginLeft0}>
                            {t("mySavings")}
                        </Text>
                        <BigNumberText value={myTotalBalance} />
                    </View>
                    <View style={[preset.marginLeftSmall, preset.marginRightSmall, preset.flex0]}>
                        <Text note={true} style={preset.marginLeft0}>
                            {t("apr")}
                        </Text>
                        <BigNumberText value={apr} suffix={"%"} decimalPlaces={2} />
                    </View>
                </CardItem>
                <CardItem style={preset.marginBottomSmall}>
                    <Left />
                    <Right>
                        <Button primary={true} bordered={true} rounded={true} disabled={refreshing} onPress={onPress}>
                            <Text style={{ fontSize: 16 }}>{t("startSaving")}</Text>
                        </Button>
                    </Right>
                </CardItem>
            </Card>
        </View>
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
