import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { TextInput } from "react-native-paper";

import { Button, Container, Text } from "native-base";
import CaptionText from "../../../components/CaptionText";
import HeadlineText from "../../../components/HeadlineText";
import TitleText from "../../../components/TitleText";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ConnectorContext } from "../../../contexts/ConnectorContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import preset from "../../../styles/preset";
import { formatValue, toBigNumber } from "../../../utils/big-number-utils";

const NewSavingsScreen = () => {
    const { t } = useTranslation(["finance", "common"]);
    const { loomConnector } = useContext(ConnectorContext);
    const { asset, decimals, apr } = useContext(SavingsContext);
    const { getBalance, updateBalance } = useContext(BalancesContext);
    const aprText = apr ? formatValue(apr, decimals, 2) + " %" : t("inquiring");
    const myBalance = getBalance(asset!.loomAddress);
    const myBalanceText = formatValue(myBalance, asset!.decimals, 2) + " " + asset!.symbol;
    const onPress = () => {};
    useEffect(() => {
        const refresh = async () => {
            if (loomConnector && asset) {
                const erc20 = loomConnector.getERC20(asset.loomAddress.toLocalAddressString());
                const balance = await erc20.balanceOf(loomConnector.address.toLocalAddressString());
                updateBalance(asset.loomAddress, toBigNumber(balance));
            }
        };
        refresh();
    }, [loomConnector, asset]);
    return (
        <Container>
            <TitleText aboveText={true}>{t("startSaving")}</TitleText>
            <CaptionText style={preset.marginBottomNormal}>{t("startSaving.description")}</CaptionText>
            <HeadlineText>{t("amount")}</HeadlineText>
            <View style={[preset.marginLeftNormal, preset.marginRightNormal]}>
                <View>
                    <TextInput
                        mode="outlined"
                        placeholder={asset!.symbol}
                        style={[preset.marginLeftSmall, preset.marginRightSmall]}
                    />
                    <Button
                        rounded={true}
                        transparent={true}
                        full={true}
                        style={{ paddingRight: 0, position: "absolute", right: 4, bottom: 0, height: 54 }}
                        onPress={onPress}>
                        <Text style={{ fontSize: 12 }}>MAX</Text>
                    </Button>
                </View>
                <View style={[preset.marginNormal]}>
                    <Row label={t("apr")} value={aprText} />
                    <Row label={t("myBalance")} value={myBalanceText} />
                </View>
                <Button primary={true} rounded={true} block={true} style={preset.marginSmall}>
                    <Text>{t("common:start")}</Text>
                </Button>
            </View>
        </Container>
    );
};

const Row = ({ label, value }) => (
    <View style={[preset.flexDirectionRow, preset.marginTopTiny, preset.marginBottomTiny]}>
        <Text style={[preset.flex0, preset.colorGrey, preset.fontSize14]}>{label}</Text>
        <Text style={[preset.flex1, preset.textAlignRight, preset.fontSize14]}>{value}</Text>
    </View>
);

export default NewSavingsScreen;
