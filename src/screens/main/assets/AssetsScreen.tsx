import React, { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusState, useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { Body, Container, Icon, ListItem } from "native-base";
import BalanceView from "../../../components/BalanceView";
import CaptionText from "../../../components/texts/CaptionText";
import SubtitleText from "../../../components/texts/SubtitleText";
import TitleText from "../../../components/texts/TitleText";
import TokenIcon from "../../../components/TokenIcon";
import { Spacing } from "../../../constants/dimension";
import { ERC20_MAX_PRECISION } from "../../../constants/token";
import { AssetContext } from "../../../contexts/AssetContext";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ChainContext } from "../../../contexts/ChainContext";
import { PendingTransactionsContext } from "../../../contexts/PendingTransactionsContext";
import useAssetBalancesUpdater from "../../../hooks/useAssetBalancesUpdater";
import useDepositionRecovery from "../../../hooks/useDepositionRecovery";
import usePendingWithdrawalHandler from "../../../hooks/usePendingWithdrawalHandler";
import preset from "../../../styles/preset";
import { pow10 } from "../../../utils/big-number-utils";

const AssetsScreen = () => {
    const { isReadOnly } = useContext(ChainContext);
    const { assets } = useContext(AssetContext);
    const { getBalance } = useContext(BalancesContext);
    const { push } = useNavigation();
    const onPress = useCallback((asset: ERC20Asset) => push(isReadOnly ? "Start" : "ManageAsset", { asset }), []);
    const renderItem = useCallback(({ item }) => <TokenListItem token={item} onPress={onPress} />, []);
    const alice = assets.find(asset => asset.symbol === "ALICE");
    const { updating, update } = useAssetsScreenEffects();
    return (
        <Container>
            <FlatList
                data={sortAssetsByBalance(assets, getBalance, alice)}
                keyExtractor={defaultKeyExtractor}
                renderItem={renderItem}
                refreshing={updating}
                onRefresh={update}
                ListHeaderComponent={<ListHeader alice={alice} onPress={onPress} />}
            />
        </Container>
    );
};

AssetsScreen.pendingWithdrawalCount = null;

const useAssetsScreenEffects = () => {
    const { updating, update } = useAssetBalancesUpdater();
    const { assets } = useContext(AssetContext);
    const { getPendingWithdrawalTransactions } = useContext(PendingTransactionsContext);
    const { handlePendingWithdrawal } = usePendingWithdrawalHandler();
    const { isFocused } = useFocusState();
    const { attemptToRecover } = useDepositionRecovery();
    const count = assets.reduce(
        (sum, asset) => sum + (getPendingWithdrawalTransactions(asset.ethereumAddress) || []).length,
        0
    );
    useEffect(() => {
        update();
        attemptToRecover();
    }, []);
    useEffect(() => {
        if (isFocused && count && Number(count) > 0) {
            handlePendingWithdrawal();
        }
    }, [count, isFocused]);
    return { updating, update };
};

const TokenListItem = ({ token, onPress }: { token: ERC20Asset; onPress: (ERC20Asset) => void }) => {
    const { getBalance } = useContext(BalancesContext);
    const balance = getBalance(token.ethereumAddress).add(getBalance(token.loomAddress));
    return (
        <ListItem
            key={token.symbol}
            button={true}
            noBorder={true}
            iconRight={true}
            onPress={useCallback(() => onPress(token), [token])}>
            <Body style={styles.tokenIcon}>
                <TokenIcon address={token.ethereumAddress.toLocalAddressString()} width={32} height={32} />
            </Body>
            <Body style={[preset.flex1, preset.marginTiny]}>
                <View>
                    <BalanceView asset={token} balance={balance} />
                    <Text style={[preset.fontSize16, preset.colorGrey]}>{token.name}</Text>
                </View>
            </Body>
            <Icon type="MaterialIcons" name="chevron-right" style={preset.colorPrimary} />
        </ListItem>
    );
};

const ListHeader = ({ alice, onPress }) => {
    const { t } = useTranslation("asset");
    return (
        <View>
            <TitleText aboveText={true}>{t("myAssets")}</TitleText>
            <CaptionText style={preset.marginBottomLarge}>{t("myAssets.description")}</CaptionText>
            {alice && (
                <>
                    <SubtitleText aboveText={true}>{t("alice")}</SubtitleText>
                    <TokenListItem token={alice} onPress={onPress} />
                    <SubtitleText aboveText={true}>{t("erc20Assets")}</SubtitleText>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    tokenIcon: { flex: 0, marginLeft: Spacing.small, paddingRight: Spacing.normal }
});

const sortAssetsByBalance = (assets, getBalance, alice) => {
    if (alice) {
        assets = assets.filter(asset => asset.symbol !== alice.symbol);
    }
    return assets.sort((t1, t2) =>
        getBalance(t2.ethereumAddress)
            .add(getBalance(t2.loomAddress))
            .sub(getBalance(t1.ethereumAddress).add(getBalance(t1.loomAddress)))
            .div(pow10(18 - ERC20_MAX_PRECISION))
            .toNumber()
    );
};

export default AssetsScreen;
