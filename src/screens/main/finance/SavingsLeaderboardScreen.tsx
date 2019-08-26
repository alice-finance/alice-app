import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { Body, Button, Container, ListItem, Text } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import SubtitleText from "../../../components/SubtitleText";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useAsyncEffect from "../../../hooks/useAsyncEffect";
import useSavingsLeaderboardLoader from "../../../hooks/useSavingsLeaderboardLoader";
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/big-number-utils";
import { openAddress } from "../../../utils/loom-utils";

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
    const onPress = useCallback(() => openAddress(rank.user), []);
    return (
        <ListItem button={true} onPress={onPress}>
            <Body style={preset.marginTiny}>
                <View style={[preset.flex1, preset.flexDirectionRow, preset.alignItemsCenter]}>
                    <Badge rank={rank.rank} />
                    <View style={[preset.flex1, preset.marginLeftSmall]}>
                        <Text style={[preset.fontSize20, preset.fontWeightBold, preset.textAlignRight]}>
                            {formatValue(toBigNumber(rank.amount), decimals, 4)} {asset!.symbol}
                        </Text>
                        <Text ellipsizeMode="middle" numberOfLines={1} style={preset.fontSize16}>
                            {rank.user}
                        </Text>
                    </View>
                </View>
            </Body>
        </ListItem>
    );
};
const Badge = ({ rank }) => {
    const color =
        rank === 1
            ? platform.brandDanger
            : rank === 2
            ? platform.brandWarning
            : rank === 3
            ? platform.brandSuccess
            : "transparent";
    const light = rank <= 3;
    return (
        <View
            style={{
                backgroundColor: color,
                borderColor: light ? color : "grey",
                borderWidth: platform.borderWidth * 2,
                width: 48,
                height: 48,
                borderRadius: 24,
                paddingTop: 4
            }}>
            <Text style={[preset.fontSize24, preset.alignCenter, light ? preset.colorLight : preset.colorGrey]}>
                {rank}
            </Text>
        </View>
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
