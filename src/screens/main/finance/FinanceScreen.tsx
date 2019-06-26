import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, StyleSheet, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import { ZERO_ADDRESS } from "@alice-finance/alice.js/dist/constants";
import { Linking } from "expo";
import { LocalAddress } from "loom-js";
import { Button, Container, Content, Icon, Text } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import CaptionText from "../../../components/CaptionText";
import EmptyView from "../../../components/EmptyView";
import SavingRecordCard from "../../../components/SavingRecordCard";
import SavingsCard from "../../../components/SavingsCard";
import Spinner from "../../../components/Spinner";
import SubtitleText from "../../../components/SubtitleText";
import TitleText from "../../../components/TitleText";
import { Spacing } from "../../../constants/dimension";
import { AssetContext } from "../../../contexts/AssetContext";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ChainContext } from "../../../contexts/ChainContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useMySavingsUpdater from "../../../hooks/useMySavingsUpdater";
import useTokenBalanceUpdater from "../../../hooks/useTokenBalanceUpdater";
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
                    <StartView />
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

const StartView = () => {
    const { navigate } = useNavigation();
    const { t } = useTranslation(["finance"]);
    const [showStart, setShowStart] = useState(false);

    const { updating, update } = useTokenBalanceUpdater();
    const { assets } = useContext(AssetContext);
    const { getBalance } = useContext(BalancesContext);

    useEffect(() => {
        update();
    }, []);

    useEffect(() => {
        if (!updating) {
            const asset = assets.find(value =>
                value.ethereumAddress.local.equals(LocalAddress.fromHexString(ZERO_ADDRESS))
            );

            setShowStart(getBalance(asset!.ethereumAddress).isZero());
        }
    }, [updating]);

    const onStartButtonPress = useCallback(() => {
        navigate("ExchangeTab");
    }, []);

    return showStart ? (
        <View style={preset.marginBottomLarge}>
            <TitleText aboveText={true}>{t("start")}</TitleText>
            <SubtitleText style={startStyle.subtitle}>{t("start.depositAsset")}</SubtitleText>
            <CaptionText style={preset.marginBottomNormal}>{t("start.description")}</CaptionText>
            <View style={startStyle.horizontalMargin}>
                <Image
                    fadeDuration={0}
                    source={require("../../../assets/alice.jpg")}
                    style={startStyle.image}
                    resizeMode="contain"
                />
            </View>
            <View style={startStyle.rightContainer}>
                <Button
                    primary={true}
                    bordered={true}
                    rounded={true}
                    onPress={onStartButtonPress}
                    style={startStyle.horizontalMargin}>
                    <Text style={startStyle.button}>{t("start.viewExchange")}</Text>
                </Button>
            </View>
        </View>
    ) : null;
};

const startStyle = StyleSheet.create({
    image: {
        width: "100%",
        height: 200,
        alignSelf: "center"
    },
    rightContainer: { flex: 1, flexDirection: "row", justifyContent: "flex-end" },
    horizontalMargin: { marginHorizontal: Spacing.small + Spacing.normal },
    subtitle: { fontSize: 18 },
    button: { fontSize: 16 }
});

export default FinanceScreen;
