import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Body, Button, Card, CardItem, Icon, Left, Right, Text } from "native-base";
import TokenIcon from "../components/TokenIcon";
import { SavingsContext } from "../contexts/SavingsContext";
import preset from "../styles/preset";
import { toBN } from "../utils/bn-utils";
import { formatValue } from "../utils/bn-utils";

const SavingsCard = () => {
    const { t } = useTranslation("finance");
    const { asset, totalBalance, myTotalPrincipal, apr } = useContext(SavingsContext);
    return (
        <View style={[preset.marginLeftNormal, preset.marginRightNormal]}>
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
                <CardItem>
                    <Left />
                    <Right>
                        <Button primary={true} transparent={true} iconRight={true}>
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
