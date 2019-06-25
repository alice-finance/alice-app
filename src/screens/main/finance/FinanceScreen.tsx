import React, { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import { Linking } from "expo";
import { Button, Container, Content, Icon } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import CaptionText from "../../../components/CaptionText";
import EmptyView from "../../../components/EmptyView";
import SavingRecordCard from "../../../components/SavingRecordCard";
import SavingsCard from "../../../components/SavingsCard";
import Spinner from "../../../components/Spinner";
import SubtitleText from "../../../components/SubtitleText";
import TitleText from "../../../components/TitleText";
import { ChainContext } from "../../../contexts/ChainContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useMySavingsUpdater from "../../../hooks/useMySavingsUpdater";
import preset from "../../../styles/preset";
import { toBigNumber } from "../../../utils/big-number-utils";

const FinanceScreen = () => {
    const { setParams } = useNavigation();
    const { t } = useTranslation(["finance", "common"]);
    const { totalBalance, myRecords } = useContext(SavingsContext);
    const sortedMyRecords = myRecords
        ? myRecords.sort((a, b) => b.initialTimestamp.getTime() - a.initialTimestamp.getTime())
        : null;
    const onPress = useCallback(() => Linking.openURL(t("common:blogUrl")), []);
    const renderItem = useCallback(({ item }) => <SavingRecordCard record={item} />, []);
    const { update } = useMySavingsUpdater();
    useScheduledUpdater();
    useEffect(() => {
        setParams({ onPress });
        if (totalBalance) {
            update();
        }
    }, [totalBalance]);
    return (
        <Container>
            <Content>
                <View>
                    <TitleText aboveText={true}>{t("savings")}</TitleText>
                    <CaptionText style={preset.marginBottomNormal}>{t("savings.description")}</CaptionText>
                    <SavingsCard />
                    <SubtitleText aboveText={true} style={preset.marginTopNormal}>
                        {t("mySavings")}
                    </SubtitleText>
                    {myRecords ? (
                        <FlatList
                            data={sortedMyRecords}
                            keyExtractor={defaultKeyExtractor}
                            renderItem={renderItem}
                            ListEmptyComponent={<EmptyView text={t("noSavingsHistory")} />}
                        />
                    ) : (
                        <Spinner compact={true} />
                    )}
                </View>
            </Content>
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
    const { loomChain } = useContext(ChainContext);
    const { totalBalance, setTotalBalance, apr, setAPR } = useContext(SavingsContext);
    useEffect(() => {
        const refresh = async () => {
            const market = loomChain!.createMoneyMarket();
            setTotalBalance(toBigNumber(await market.totalFunds()));
            setAPR(toBigNumber(await market.getCurrentSavingsAPR()).mul(toBigNumber(100)));
        };
        refresh();
        const handle = setInterval(() => refresh(), 60 * 1000);
        return () => clearInterval(handle);
    }, []);
    return { apr, totalSavings: totalBalance };
};

export default FinanceScreen;
