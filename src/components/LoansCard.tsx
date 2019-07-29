import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { Body, Button, Card, CardItem, Left, Right, Text } from "native-base";
import { SavingsContext } from "../contexts/SavingsContext";
import preset from "../styles/preset";
import BigNumberText from "./BigNumberText";
import TokenIcon from "./TokenIcon";

const LoansCard = collateral => {
    const { t } = useTranslation("finance");
    const { push } = useNavigation();
    const { asset } = useContext(SavingsContext);
    const totalBalance = toBigNumber("10000000000000000000000");
    const myTotalBalance = toBigNumber("120000000000000000000");
    const apr = toBigNumber("14990000000000000000");
    const onPress = useCallback(() => push("NewLoan", { collateral }), [collateral]);
    return (
        <View style={[preset.marginNormal, preset.marginTopTiny]}>
            <Card>
                <CardItem>
                    <Left>
                        {/*<TokenIcon address={collateral!.ethereumAddress.toLocalAddressString()} width={56} height={56} />*/}
                        <TokenIcon address={"0"} width={56} height={56} />
                        <Body style={preset.marginLeftNormal}>
                            <Text style={[preset.fontSize24, preset.fontWeightBold]}>{collateral.name}ASSET</Text>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={[preset.colorDanger]}>{t("loanStatus.danger")} 3</Text>
                                <Text> · </Text>
                                <Text style={[preset.colorCaution]}>{t("loanStatus.caution")} 1</Text>
                                <Text> · </Text>
                                <Text style={[preset.colorSafe]}>{t("loanStatus.safe")} 5</Text>
                            </View>
                        </Body>
                    </Left>
                </CardItem>
                <CardItem>
                    <View style={[preset.marginLeftSmall, preset.flex1]}>
                        <Text note={true} style={preset.marginLeft0}>
                            {t("totalLoanAmount")}
                        </Text>
                        <BigNumberText value={totalBalance} />
                    </View>
                    <View style={[preset.marginLeftSmall, preset.flex1]}>
                        <Text note={true} style={preset.marginLeft0}>
                            {t("myLoan")}
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
                        <Button primary={true} bordered={true} rounded={true} disabled={false} onPress={onPress}>
                            <Text style={{ fontSize: 16 }}>{t("borrowToken", { symbol: asset!.symbol })}</Text>
                        </Button>
                    </Right>
                </CardItem>
            </Card>
        </View>
    );
};

export default LoansCard;
