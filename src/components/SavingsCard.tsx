import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Body, Button, Card, CardItem, Icon, Left, Right, Text } from "native-base";
import TokenIcon from "../components/TokenIcon";
import { SavingsContext } from "../contexts/SavingsContext";
import preset from "../styles/preset";
import { toBN } from "../utils/bn-utils";
import { formatValue } from "../utils/bn-utils";

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
                            <Text>{asset!.name}</Text>
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
                            <BNText value={totalBalance} />
                        </View>
                    </Body>
                    <Body style={preset.marginLeftSmall}>
                        <View>
                            <Text note={true} style={preset.marginLeft0}>
                                {t("mySavings")}
                            </Text>
                            <BNText value={myTotalPrincipal} />
                        </View>
                    </Body>
                    <Body style={preset.marginLeftSmall}>
                        <View>
                            <Text note={true} style={preset.marginLeft0}>
                                {t("apr")}
                            </Text>
                            <BNText value={apr} suffix={"%"} />
                        </View>
                    </Body>
                </CardItem>
                <CardItem style={preset.marginBottomSmall}>
                    <Left />
                    <Right>
                        <Button primary={true} rounded={true} iconRight={true} onPress={onPress}>
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
    let profit = toBN(0);
    if (myTotalPrincipal && myTotalBalance && !myTotalPrincipal.isZero()) {
        profit = myTotalBalance
            .sub(myTotalPrincipal)
            .mul(toBN(10000))
            .div(myTotalPrincipal);
    }
    const text =
        myTotalPrincipal && !myTotalPrincipal.isZero() ? "+" + formatValue(profit, 2, 2) : t("startSavingsNow");
    return (
        <Text note={true} style={profit.isZero() ? [] : preset.colorInfo}>
            {text}
        </Text>
    );
};

const BNText = ({ value, suffix = "" }) => {
    const { t } = useTranslation("finance");
    const { asset, decimals } = useContext(SavingsContext);
    return <Text>{value ? formatValue(value, decimals, 2) + " " + asset!.symbol + " " + suffix : t("inquiring")}</Text>;
};

export default SavingsCard;
