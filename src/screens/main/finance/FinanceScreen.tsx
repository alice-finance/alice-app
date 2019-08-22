import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, View } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import { useNavigation } from "react-navigation-hooks";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
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
    const { update } = useMySavingsUpdater();
    useEffect(() => {
        if (totalBalance) {
            update();
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
                    itemWidth={sliderWidth * 0.9}
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
