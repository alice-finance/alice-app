import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { Body, Button, Container, ListItem, Text } from "native-base";
import SubtitleText from "../../../components/SubtitleText";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useAsyncEffect from "../../../hooks/useAsyncEffect";
import useSavingsLeaderboardLoader from "../../../hooks/useSavingsLeaderboardLoader";
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/big-number-utils";

const SavingsLeaderboardScreen = () => {
    const renderItem = useCallback(({ item }) => <RankItem rank={item} />, []);
    const { loadSavingsLeaderboard, savingsLeaderboard } = useSavingsLeaderboardLoader();
    useAsyncEffect(loadSavingsLeaderboard, []);
    return (
        <Container>
            <FlatList
                data={savingsLeaderboard}
                keyExtractor={defaultKeyExtractor}
                renderItem={renderItem}
                refreshing={!savingsLeaderboard}
                onRefresh={loadSavingsLeaderboard}
                ListHeaderComponent={<ListHeader onPress={loadSavingsLeaderboard} />}
            />
        </Container>
    );
};

const RankItem = ({ rank }) => {
    const { asset, decimals } = useContext(SavingsContext);
    return (
        <ListItem>
            <Body style={preset.marginLeftTiny}>
                <View style={[preset.flex1, preset.flexDirectionRow, preset.alignItemsCenter]}>
                    <Text style={[preset.fontSize24, preset.fontWeightBold]}>#{rank.rank}</Text>
                    <Text style={[preset.flex1, preset.fontSize20, preset.marginLeftSmall]}>
                        {formatValue(toBigNumber(rank.amount), decimals, 4)} {asset!.symbol}
                    </Text>
                </View>
                <Text note={true} ellipsizeMode="middle" numberOfLines={1}>
                    {rank.user}
                </Text>
            </Body>
        </ListItem>
    );
};

const ListHeader = ({ onPress }) => {
    const { t } = useTranslation("finance");
    return (
        <View style={preset.flexDirectionRow}>
            <SubtitleText style={[preset.flex1]}>{t("leaderboard")}</SubtitleText>
            <Button transparent={true} rounded={true} small={true} onPress={onPress} style={preset.marginNormal}>
                <Text>{t("common:refresh")}</Text>
            </Button>
        </View>
    );
};

export default SavingsLeaderboardScreen;
