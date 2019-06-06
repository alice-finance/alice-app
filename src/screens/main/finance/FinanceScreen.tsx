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
import { ConnectorContext } from "../../../contexts/ConnectorContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import preset from "../../../styles/preset";
import { toBigNumber } from "../../../utils/big-number-utils";

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
    const { loomConnector } = useContext(ConnectorContext);
    const { totalBalance, setTotalBalance, apr, setAPR } = useContext(SavingsContext);
    useEffect(() => {
        const refresh = async () => {
            const market = loomConnector!.getMoneyMarket();
            setTotalBalance(toBigNumber(await market.totalFunds()));
            setAPR(toBigNumber(await market.getAPR()).mul(toBigNumber(100)));
        };
        refresh();
        const handle = setInterval(() => refresh(), 60 * 1000);
        return () => clearInterval(handle);
    }, []);
    return { apr, totalSavings: totalBalance };
};

const useMySavingsUpdater = () => {
    const { loomConnector } = useContext(ConnectorContext);
    const { myRecords, setMyRecords } = useContext(SavingsContext);
    useEffect(() => {
        const refresh = async () => {
            const market = loomConnector!.getMoneyMarket();
            const savingRecords = await market.getSavingsRecords(loomConnector!.address.toLocalAddressString());
            setMyRecords(savingRecords);
        };
        refresh();
    }, []);
    return { mySavingsRecords: myRecords };
};

export default FinanceScreen;
