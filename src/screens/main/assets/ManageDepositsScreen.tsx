import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "react-navigation-hooks";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { Button, Card, CardItem, Text, View } from "native-base";
import BalanceView from "../../../components/BalanceView";
import CaptionText from "../../../components/CaptionText";
import HeadlineText from "../../../components/HeadlineText";
import TitleText from "../../../components/TitleText";
import { BalancesContext } from "../../../contexts/BalancesContext";
import preset from "../../../styles/preset";

const ManageDepositsScreen = () => {
    const { t } = useTranslation("asset");
    const { getBalance } = useContext(BalancesContext);
    const { push, getParam } = useNavigation();
    const asset: ERC20Asset = getParam("asset");
    return (
        <View>
            <TitleText aboveText={true}>{t("manageDepositedAmount")}</TitleText>
            <BalanceCard
                title={t("ethereumWallet")}
                description={t("ethereumWallet.description")}
                balance={getBalance(asset.ethereumAddress)}
                asset={asset}
                buttonText={t("deposit")}
                onPressButton={useCallback(() => push("Deposit", { asset }), [asset])}
            />
            <BalanceCard
                title={t("aliceWallet")}
                description={t("aliceWallet.description")}
                balance={getBalance(asset.loomAddress)}
                asset={asset}
                buttonText={t("withdrawal")}
                onPressButton={useCallback(() => push("Withdrawal", { asset }), [asset])}
            />
        </View>
    );
};

const BalanceCard = ({ title, description, balance, asset, buttonText, onPressButton }) => {
    return (
        <View style={[preset.marginNormal]}>
            <Card>
                <CardItem>
                    <View>
                        <HeadlineText aboveText={true} style={[preset.marginLeftSmall]}>
                            {title}
                        </HeadlineText>
                        <CaptionText small={true} style={preset.marginLeftSmall}>
                            {description}
                        </CaptionText>
                    </View>
                </CardItem>
                <CardItem>
                    <View style={preset.flex1}>
                        <BalanceView
                            asset={asset}
                            balance={balance}
                            style={[preset.alignCenter, preset.marginBottomSmall]}
                        />
                        <Button
                            primary={true}
                            bordered={true}
                            rounded={true}
                            onPress={onPressButton}
                            style={[preset.alignFlexEnd, preset.marginSmall]}>
                            <Text>{buttonText}</Text>
                        </Button>
                    </View>
                </CardItem>
            </Card>
        </View>
    );
};

export default ManageDepositsScreen;
