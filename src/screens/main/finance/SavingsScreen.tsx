import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleProp, View, ViewStyle } from "react-native";
import useCurrentAPRUpdater from "../../../hooks/useCurrentAPRUpdater";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { Body, Container, Content, Icon, ListItem, Text } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import RefreshButton from "../../../components/buttons/RefreshButton";
import NewSavingsCard from "../../../components/cards/NewSavingsCard";
import EmptyView from "../../../components/EmptyView";
import Spinner from "../../../components/Spinner";
import CaptionText from "../../../components/texts/CaptionText";
import MomentText from "../../../components/texts/MomentText";
import NoteText from "../../../components/texts/NoteText";
import SubtitleText from "../../../components/texts/SubtitleText";
import TitleText from "../../../components/texts/TitleText";
import TokenIcon from "../../../components/TokenIcon";
import { AssetContext } from "../../../contexts/AssetContext";
import { ChainContext } from "../../../contexts/ChainContext";
import { SavingsContext } from "../../../contexts/SavingsContext";
import useAsyncEffect from "../../../hooks/useAsyncEffect";
import useRecentClaimsLoader from "../../../hooks/useRecentClaimsLoader";
import useRecentSavingsLoader from "../../../hooks/useRecentSavingsLoader";
import useSavingsLeaderboardLoader from "../../../hooks/useSavingsLeaderboardLoader";
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/big-number-utils";
import { compoundToAPR } from "../../../utils/interest-rate-utils";
import { openAddress, openTx } from "../../../utils/loom-utils";

const SavingsScreen = () => {
    return (
        <Container>
            <Content>
                <NewSavingsSection />
                <LeaderboardSection />
                <RecentSavings />
                <RecentClaims />
            </Content>
        </Container>
    );
};

const NewSavingsSection = () => {
    const { t } = useTranslation("savings");
    useCurrentAPRUpdater();
    return (
        <View style={preset.marginBottomLarge}>
            <TitleText aboveText={true}>{t("title")}</TitleText>
            <CaptionText style={preset.marginBottomNormal}>{t("description")}</CaptionText>
            <NewSavingsCard />
            <NoteText style={[preset.alignFlexEnd, preset.marginRightNormal]}>{t("newSavings.note")}</NoteText>
        </View>
    );
};

const LeaderboardSection = () => {
    const { t } = useTranslation("savings");
    const renderItem = useCallback(({ item }) => <RankItem rank={item} me={false} />, []);
    const { loomChain } = useContext(ChainContext);
    const { loadMyRank, myRank, loadSavingsLeaderboard, savingsLeaderboard } = useSavingsLeaderboardLoader();
    const load = useCallback(async () => {
        await loadSavingsLeaderboard(5);
        await loadMyRank(loomChain!.getAddress().toLocalAddressString());
    }, []);
    useAsyncEffect(load, []);
    return (
        <View style={preset.marginBottomLarge}>
            <SubtitleText aboveText={true}>{t("leaderboard")}</SubtitleText>
            <CaptionText>{t("leaderboard.description")}</CaptionText>
            <FlatList
                data={savingsLeaderboard}
                keyExtractor={defaultKeyExtractor}
                renderItem={renderItem}
                refreshing={!savingsLeaderboard}
                onRefresh={load}
            />
            {myRank && (
                <View>
                    <Icon type={"MaterialCommunityIcons"} name={"dots-vertical"} style={preset.marginLeftLarge} />
                    <RankItem rank={myRank} me={true} />
                </View>
            )}
        </View>
    );
};

const RankItem = ({ rank, me }) => {
    const { asset, decimals } = useContext(SavingsContext);
    const onPress = useCallback(() => openAddress(rank.user), []);
    return (
        <ListItem button={true} noBorder={true} onPress={onPress}>
            <Body style={preset.marginTiny}>
                <View style={[preset.flex1, preset.flexDirectionRow, preset.alignItemsCenter]}>
                    <Badge rank={rank.rank} me={me} />
                    <View style={[preset.flex1, preset.marginLeftSmall]}>
                        <Text style={[preset.fontSize20, preset.fontWeightBold, preset.textAlignRight]}>
                            {formatValue(toBigNumber(rank.amount), decimals, 4)} {asset!.symbol}
                        </Text>
                    </View>
                </View>
            </Body>
        </ListItem>
    );
};

const Badge = ({ rank, me }) => {
    const { t } = useTranslation("savings");
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
        <View style={badgeStyle(color, light)}>
            <Text style={[preset.fontSize20, preset.alignCenter, light ? preset.colorLight : preset.colorGrey]}>
                {rank}
            </Text>
            {me && (
                <Text style={[preset.fontSize12, preset.alignCenter, light ? preset.colorLight : preset.colorGrey]}>
                    {t("leaderboard.me")}
                </Text>
            )}
        </View>
    );
};

const badgeStyle = (color, light): StyleProp<ViewStyle> => ({
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color,
    borderColor: light ? color : "grey",
    borderWidth: platform.borderWidth * 2,
    width: 48,
    height: 48,
    borderRadius: 24
});

const RecentSavings = () => {
    const { t } = useTranslation(["savings", "common"]);
    const renderItem = useCallback(({ item }) => <SavingsItem savings={item} />, []);
    const { loadRecentSavings, recentSavings } = useRecentSavingsLoader();
    const onPress = loadRecentSavings;
    useAsyncEffect(loadRecentSavings, []);
    return (
        <View style={preset.marginBottomLarge}>
            <View style={[preset.flexDirectionRow]}>
                <SubtitleText aboveText={true} style={[preset.flex1]}>
                    {t("recentSavings")}
                </SubtitleText>
                <RefreshButton onPress={onPress} />
            </View>
            <CaptionText>{t("recentSavings.description")}</CaptionText>
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
        <ListItem button={true} iconRight={true} onPress={onPress}>
            <Body style={[preset.flex0, preset.marginLeftSmall, preset.marginRightSmall]}>
                <TokenIcon address={asset!.ethereumAddress.toLocalAddressString()} width={32} height={32} />
                <Text style={[preset.fontSize16, preset.textAlignCenter, { marginLeft: 0 }]}>
                    {formatValue(toBigNumber(apr), decimals, 2)}%
                </Text>
            </Body>
            <Body>
                <View style={[preset.flex1, preset.flexDirectionRow, preset.alignItemsCenter]}>
                    <Text style={[preset.flex1, preset.fontSize20]}>
                        {formatValue(savings.balance, asset!.decimals)} {asset!.symbol}
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

const RecentClaims = () => {
    const { t } = useTranslation(["savings", "common"]);
    const { assets } = useContext(AssetContext);
    const asset = assets.find(a => a.symbol === "ALICE");
    const renderItem = useCallback(({ item }) => <ClaimItem claim={item} asset={asset} />, []);
    const { loadRecentClaims, recentClaims } = useRecentClaimsLoader();
    const onPress = loadRecentClaims;
    useAsyncEffect(loadRecentClaims, []);
    return (
        <View style={preset.marginBottomLarge}>
            <View style={[preset.flexDirectionRow, preset.marginTopLarge]}>
                <SubtitleText aboveText={true} style={[preset.flex1]}>
                    {t("recentClaims")}
                </SubtitleText>
                <RefreshButton onPress={onPress} />
            </View>
            <CaptionText>{t("recentClaims.description")}</CaptionText>
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
                <TokenIcon address={asset.ethereumAddress.toLocalAddressString()} width={32} height={32} />
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

export default SavingsScreen;