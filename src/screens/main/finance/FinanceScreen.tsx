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
import AliceIFOView from "../../../components/AliceIFOView";
import CaptionText from "../../../components/CaptionText";
import EmptyView from "../../../components/EmptyView";
import MomentText from "../../../components/MomentText";
import SavingRecordCard from "../../../components/SavingRecordCard";
import SavingsCard from "../../../components/SavingsCard";
import Spinner from "../../../components/Spinner";
import SubtitleText from "../../../components/SubtitleText";
import TitleText from "../../../components/TitleText";
import TokenIcon from "../../../components/TokenIcon";
import { AssetContext } from "../../../contexts/AssetContext";
import { ChainContext } from "../../../contexts/ChainContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useAsyncEffect from "../../../hooks/useAsyncEffect";
import useMySavingsLoader from "../../../hooks/useMySavingsLoader";
import useRecentClaimsLoader from "../../../hooks/useRecentClaimsLoader";
import useRecentSavingsLoader from "../../../hooks/useRecentSavingsLoader";
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/big-number-utils";
import { compoundToAPR } from "../../../utils/interest-rate-utils";
import { openTx } from "../../../utils/loom-utils";
import AuthScreen from "../../AuthScreen";

const FinanceScreen = () => {
    const { setParams } = useNavigation();
    const { t } = useTranslation("finance");
    const { isReadOnly } = useContext(ChainContext);
    const { myTotalBalance } = useContext(SavingsContext);
    const { assets } = useContext(AssetContext);
    const alice = assets.find(a => a.symbol === "ALICE");
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
                    {(isReadOnly || (myTotalBalance && myTotalBalance.isZero())) && <AliceIFOView />}
                    <TitleText aboveText={true}>{t("savings")}</TitleText>
                    <CaptionText style={preset.marginBottomNormal}>{t("savings.description")}</CaptionText>
                    <SavingsCard />
                    {!isReadOnly && <MySavings />}
                    <RecentSavings />
                    <RecentClaims asset={alice} />
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
    const sortedMyRecords = myRecords
        ? myRecords
              .filter(r => !r.balance.isZero())
              .sort((a, b) => b.initialTimestamp.getTime() - a.initialTimestamp.getTime())
        : null;
    return (
        <View>
            <SubtitleText aboveText={true} style={[preset.flex1, preset.marginTopNormal]}>
                {t("mySavings")}
            </SubtitleText>
            <MySavingsCarousel myRecords={sortedMyRecords} />
        </View>
    );
};

const MySavingsCarousel = ({ myRecords }) => {
    const { t } = useTranslation("finance");
    const renderItem = useCallback(({ item }) => <SavingRecordCard record={item} />, []);
    const [sliderWidth] = useState(Dimensions.get("window").width);
    const [selection, setSelection] = useState(0);
    return myRecords ? (
        myRecords.length > 0 ? (
            <View>
                <Carousel
                    data={myRecords}
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
    const onPress = useCallback(() => openTx(savings.transactionHash), []);
    const [apr] = useState(() => compoundToAPR(savings.rate, decimals));
    return (
        <ListItem button={true} noBorder={true} iconRight={true} onPress={onPress}>
            <Body style={[preset.flex0, preset.marginLeftSmall, preset.marginRightSmall]}>
                <TokenIcon address={asset!.ethereumAddress.toLocalAddressString()} width={32} height={32} />
            </Body>
            <Body>
                <View style={[preset.flex1, preset.flexDirectionRow, preset.alignItemsCenter]}>
                    <Text style={[preset.fontSize20]}>
                        {formatValue(savings.balance, asset!.decimals)} {asset!.symbol}
                    </Text>
                    <Text style={[preset.flex1, preset.fontSize16, { marginLeft: 0 }]}>
                        {formatValue(toBigNumber(apr).mul(100), decimals, 2)}%
                    </Text>
                    <MomentText date={new Date(savings.timestamp * 1000)} note={true} />
                </View>
                <Text ellipsizeMode="middle" numberOfLines={1} style={[preset.fontSize16, preset.colorGrey]}>
                    {savings.owner}
                </Text>
            </Body>
        </ListItem>
    );
};

const RecentClaims = ({ asset }) => {
    const { t } = useTranslation(["finance", "common"]);
    const renderItem = useCallback(({ item }) => <ClaimItem claim={item} asset={asset} />, []);
    const { loadRecentClaims, recentClaims } = useRecentClaimsLoader();
    const onPress = loadRecentClaims;
    useAsyncEffect(loadRecentClaims, []);
    return (
        <View>
            <View style={[preset.flexDirectionRow, preset.marginTopLarge]}>
                <SubtitleText aboveText={true} style={[preset.flex1]}>
                    {t("recentClaims")}
                </SubtitleText>
                <Button transparent={true} rounded={true} small={true} onPress={onPress} style={preset.marginNormal}>
                    <Text>{t("common:refresh")}</Text>
                </Button>
            </View>
            {recentClaims ? (
                <FlatList
                    data={recentClaims}
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

const ClaimItem = ({ claim, asset }) => {
    const onPress = useCallback(() => openTx(claim.transactionHash), []);
    return (
        <ListItem button={true} onPress={onPress}>
            <Body style={[preset.flex0, preset.marginLeftSmall, preset.marginRightSmall]}>
                <TokenIcon address={asset!.ethereumAddress.toLocalAddressString()} width={32} height={32} />
            </Body>
            <Body>
                <View style={[preset.flex1, preset.flexDirectionRow, preset.alignItemsCenter]}>
                    <Text style={[preset.flex1, preset.fontSize20]}>{formatValue(claim.amount, 18)} ALICE</Text>
                    <MomentText date={new Date(claim.timestamp * 1000)} note={true} />
                </View>
                <Text ellipsizeMode="middle" numberOfLines={1} style={[preset.fontSize16, preset.colorGrey]}>
                    {claim.user}
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
    const { isReadOnly } = useContext(ChainContext);
    const { push } = useNavigation();
    useEffect(() => {
        if (!isReadOnly) {
            AuthScreen.getSavedPasscode().then(passcode => {
                if (!passcode || passcode === "") {
                    push("Auth", { needsRegistration: true, firstTime: true });
                }
            });
        }
    }, []);
};

export default FinanceScreen;
