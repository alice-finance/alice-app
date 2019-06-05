import React, { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Linking } from "expo";
import { Button, Container, Icon } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import CaptionText from "../../../components/CaptionText";
import SavingsCard from "../../../components/SavingsCard";
import TitleText from "../../../components/TitleText";
import { SavingsContext } from "../../../contexts/SavingsContext";
import { WalletContext } from "../../../contexts/WalletContext";
import preset from "../../../styles/preset";
import { toBN } from "../../../utils/bn-utils";

const FinanceScreen = () => {
    const { setParams } = useNavigation();
    const { t } = useTranslation(["finance", "common"]);
    const onPress = useCallback(() => Linking.openURL(t("common:blogUrl")), []);
    useScheduledUpdater();
    useMySavingsUpdater();
    useEffect(() => {
        setParams({ onPress });
    }, []);
    return (
        <Container>
            <View>
                <TitleText aboveText={true}>{t("savings")}</TitleText>
                <CaptionText style={preset.marginBottomNormal}>{t("savings.description")}</CaptionText>
                <SavingsCard />
            </View>
        </Container>
    );
};

FinanceScreen.navigationOptions = ({ navigation }) => ({
    headerRight: (
        <Button rounded={true} transparent={true} onPress={navigation.getParam("onPress")}>
            <Icon type="SimpleLineIcons" name="info" style={{ color: platform.brandPrimary }} />
        </Button>
    )
});

const useScheduledUpdater = () => {
    const { loomWallet } = useContext(WalletContext);
    const { totalBalance, setTotalBalance, apr, setAPR } = useContext(SavingsContext);
    useEffect(() => {
        const refresh = async () => {
            const market = await loomWallet!.MoneyMarket.deployed();
            setTotalBalance(toBN(await market.totalFunds()));
            setAPR(toBN(await market.getAPR()).mul(toBN(100)));
        };
        refresh();
        const handle = setInterval(() => refresh(), 60 * 1000);
        return () => clearInterval(handle);
    }, []);
    return { apr, totalSavings: totalBalance };
};

const useMySavingsUpdater = () => {
    const { loomWallet } = useContext(WalletContext);
    const { myRecords, setMyRecords } = useContext(SavingsContext);
    useEffect(() => {
        const refresh = async () => {
            const market = await loomWallet!.MoneyMarket.deployed();
            const savingRecords = await market.getSavingsRecords(loomWallet!.address.toLocalAddressString());
            setMyRecords(savingRecords);
        };
        refresh();
    }, []);
    return { mySavingsRecords: myRecords };
};

export default FinanceScreen;
