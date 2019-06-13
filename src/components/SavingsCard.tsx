import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Body, Button, Card, CardItem, Icon, Left, Right, Text } from "native-base";
import TokenIcon from "../components/TokenIcon";
import { SavingsContext } from "../contexts/SavingsContext";
import preset from "../styles/preset";
import { toBigNumber } from "../utils/big-number-utils";
import { formatValue } from "../utils/big-number-utils";
import BigNumberText from "./BigNumberText";

const SavingsCard = () => {
    const { t } = useTranslation("finance");
    const { push } = useNavigation();
    const { asset, totalBalance, myTotalPrincipal, apr } = useContext(SavingsContext);
    const onPress = useCallback(() => push("NewSavings"), []);
    return (
        <View style={[preset.marginNormal]}>
            <Card>
                <CardItem>
                    <Left>
                        <TokenIcon address={asset!.ethereumAddress.toLocalAddressString()} width={56} height={56} />
                        <Body style={preset.marginLeftNormal}>
                            <Text style={{ fontWeight: "bold" }}>{asset!.name}</Text>
                            <MySavingsSummaryText />
                        </Body>
                    </Left>
                </CardItem>
                <CardItem>
                    <Body style={preset.marginLeftSmall}>
                        <View>
                            <Text note={true} style={preset.marginLeft0}>
                                {t("totalBalance")}
                            </Text>
                            <BigNumberText value={totalBalance} />
                        </View>
                    </Body>
                    <Body style={preset.marginLeftSmall}>
                        <View>
                            <Text note={true} style={preset.marginLeft0}>
                                {t("mySavings")}
                            </Text>
                            <BigNumberText value={myTotalPrincipal} />
                        </View>
                    </Body>
                    <Body style={preset.marginLeftSmall}>
                        <View>
                            <Text note={true} style={preset.marginLeft0}>
                                {t("apr")}
                            </Text>
                            <BigNumberText value={apr} suffix={"%"} />
                        </View>
                    </Body>
                </CardItem>
                <CardItem style={preset.marginBottomSmall}>
                    <Left />
                    <Right>
                        <Button primary={true} bordered={true} rounded={true} iconRight={true} onPress={onPress}>
                            <Text style={{ fontSize: 16, paddingRight: 8 }}>{t("startSaving")}</Text>
                            <Icon type="SimpleLineIcons" name="paper-plane" style={{ fontSize: 18 }} />
                        </Button>
                    </Right>
                </CardItem>
            </Card>
        </View>
    );
};

const MySavingsSummaryText = () => {
    const { t } = useTranslation("finance");
    const { myTotalPrincipal, myTotalBalance } = useContext(SavingsContext);
    let profit = toBigNumber(0);
    if (myTotalPrincipal && myTotalBalance && !myTotalPrincipal.isZero()) {
        profit = myTotalBalance
            .sub(myTotalPrincipal)
            .mul(toBigNumber(10000))
            .div(myTotalPrincipal);
    }
    const text =
        myTotalPrincipal && !myTotalPrincipal.isZero() ? "+" + formatValue(profit, 2, 2) + "%" : t("startSavingsNow");
    return <Text style={profit.isZero() ? [] : preset.colorInfo}>{text}</Text>;
};

export default SavingsCard;
