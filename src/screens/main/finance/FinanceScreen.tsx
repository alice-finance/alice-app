import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, FlatList, View } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import { useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { Linking } from "expo";
import { Body, Button, Container, Content, Icon, ListItem, Text } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import CaptionText from "../../../components/CaptionText";
import EmptyView from "../../../components/EmptyView";
import MomentText from "../../../components/MomentText";
import SavingRecordCard from "../../../components/SavingRecordCard";
import SavingsCard from "../../../components/SavingsCard";
import Spinner from "../../../components/Spinner";
import SubtitleText from "../../../components/SubtitleText";
import TitleText from "../../../components/TitleText";
import { ChainContext } from "../../../contexts/ChainContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useAsyncEffect from "../../../hooks/useAsyncEffect";
import useMySavingsLoader from "../../../hooks/useMySavingsLoader";
import useRecentSavingsLoader from "../../../hooks/useRecentSavingsLoader";
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/big-number-utils";
import { compoundToAPR } from "../../../utils/interest-rate-utils";
import AuthScreen from "../../AuthScreen";

const FinanceScreen = () => {
    const { setParams } = useNavigation();
    const { t } = useTranslation("finance");
    const onPress = useCallback(() => Linking.openURL(t("common:blogUrl")), []);
    useScheduledUpdater();
    usePasscodeRegistration();
    useEffect(() => {
        setParams({ onPress });
    }, []);
    return (
        <Container>
            <Content>
                <View>
                    <TitleText aboveText={true}>{t("savings")}</TitleText>
                    <CaptionText style={preset.marginBottomNormal}>{t("savings.description")}</CaptionText>
                    <SavingsCard />
                    <MySavings />
                    <RecentSavings />
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

const MySavings = () => {
    const { t } = useTranslation("finance");
    const { totalBalance, myRecords } = useContext(SavingsContext);
    const { load } = useMySavingsLoader();
    useEffect(() => {
        if (totalBalance) {
            load();
        }
    }, [totalBalance]);
    return (
        <View>
            <SubtitleText aboveText={true} style={[preset.flex1, preset.marginTopNormal]}>
                {t("mySavings")}
            </SubtitleText>
            <MySavingsCarousel myRecords={myRecords} />
        </View>
    );
};

const MySavingsCarousel = ({ myRecords }) => {
    const { t } = useTranslation("finance");
    const sortedMyRecords = myRecords
        ? myRecords.sort((a, b) => b.initialTimestamp.getTime() - a.initialTimestamp.getTime())
        : null;
    const renderItem = useCallback(({ item }) => <SavingRecordCard record={item} />, []);
    const [sliderWidth] = useState(Dimensions.get("window").width);
    const [selection, setSelection] = useState(0);
    return myRecords ? (
        myRecords.length > 0 ? (
            <View>
                <Carousel
                    data={sortedMyRecords}
                    renderItem={renderItem}
                    sliderWidth={sliderWidth}
                    itemWidth={sliderWidth}
                    activeSlideAlignment={"start"}
                    inactiveSlideScale={1.0}
                    onSnapToItem={setSelection}
                />
                <Pagination dotsLength={myRecords.length} activeDotIndex={selection} dotColor={platform.colorPrimary} />
            </View>
        ) : (
            <EmptyView text={t("noSavingsHistory")} />
        )
    ) : (
        <Spinner compact={true} />
    );
};

const RecentSavings = () => {
    const { t } = useTranslation(["finance", "common"]);
    const renderItem = useCallback(({ item }) => <SavingsItem savings={item} />, []);
    const { loadRecentSavings, recentSavings } = useRecentSavingsLoader();
    const onPress = loadRecentSavings;
    useAsyncEffect(loadRecentSavings, []);
    return (
        <View>
            <View style={[preset.flexDirectionRow]}>
                <SubtitleText aboveText={true} style={[preset.flex1]}>
                    {t("recentSavings")}
                </SubtitleText>
                <Button transparent={true} rounded={true} small={true} onPress={onPress} style={preset.marginNormal}>
                    <Text>{t("common:refresh")}</Text>
                </Button>
            </View>
            {recentSavings ? (
                <FlatList
                    data={recentSavings}
                    keyExtractor={defaultKeyExtractor}
                    renderItem={renderItem}
                    ListEmptyComponent={<EmptyView text={t("noSavingsHistory")} />}
                />
            ) : (
                <Spinner compact={true} />
            )}
        </View>
    );
};

const SavingsItem = ({ savings }) => {
    const { asset, decimals } = useContext(SavingsContext);
    const [apr] = useState(() => compoundToAPR(savings.rate, decimals));
    return (
        <ListItem>
            <Body style={preset.marginLeftTiny}>
                <View style={[preset.flex1, preset.flexDirectionRow, preset.alignItemsCenter]}>
                    <Text style={[preset.fontSize24, preset.fontWeightBold]}>#{savings.recordId}</Text>
                    <Text style={[preset.flex1, preset.fontSize20, preset.marginLeftSmall]}>
                        {formatValue(toBigNumber(apr).mul(100), decimals, 2)}%
                    </Text>
                    <MomentText date={new Date(savings.timestamp * 1000)} note={true} />
                </View>
                <Text style={[preset.fontSize24]}>
                    {formatValue(savings.balance, asset!.decimals)} {asset!.symbol}
                </Text>
            </Body>
        </ListItem>
    );
};

const useScheduledUpdater = () => {
    const { loomChain } = useContext(ChainContext);
    const { totalBalance, setTotalBalance, apr, setAPR } = useContext(SavingsContext);
    useEffect(() => {
        const refresh = async () => {
            const market = loomChain!.getMoneyMarket();
            setTotalBalance(toBigNumber(await market.totalFunds()));
            setAPR(toBigNumber(await market.getCurrentSavingsAPR()).mul(toBigNumber(100)));
        };
        refresh();
        const handle = setInterval(() => refresh(), 60 * 1000);
        return () => clearInterval(handle);
    }, []);
    return { apr, totalSavings: totalBalance };
};

const usePasscodeRegistration = () => {
    const { push } = useNavigation();
    useEffect(() => {
        AuthScreen.getSavedPasscode().then(passcode => {
            if (!passcode || passcode === "") {
                push("Auth", { needsRegistration: true, firstTime: true });
            }
        });
    }, []);
};

export default FinanceScreen;
