import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusState, useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { Body, Button, Container, Icon, ListItem } from "native-base";
import BalanceView from "../../../components/BalanceView";
import ClosingView from "../../../components/ClosingView";
import TitleText from "../../../components/TitleText";
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
    const { updating, update } = useAssetBalancesUpdater();
    const { sortedByName, setSortedByName, sortedTokens } = useTokenSorter();
    const { handlePendingWithdrawal } = usePendingWithdrawalHandler();
    const { isReadOnly } = useContext(ChainContext);
    const { assets } = useContext(AssetContext);
    const { getPendingWithdrawalTransactions } = useContext(PendingTransactionsContext);
    const { push, setParams } = useNavigation();
    const { isFocused } = useFocusState();
    const { attemptToRecover } = useDepositionRecovery();
    const onSort = useCallback(() => setSortedByName(!sortedByName), [sortedByName]);
    const onPress = useCallback((asset: ERC20Asset) => push(isReadOnly ? "Start" : "ManageAsset", { asset }), []);
    const renderItem = useCallback(({ item }) => <TokenListItem token={item} onPress={onPress} />, []);
    const count = assets.reduce(
        (sum, asset) => sum + (getPendingWithdrawalTransactions(asset.ethereumAddress) || []).length,
        0
    );
    useEffect(() => {
        setParams({ onSort });
        update();
        attemptToRecover();
    }, []);

    useEffect(() => {
        if (isFocused && count && Number(count) > 0) {
            handlePendingWithdrawal();
        }
    }, [count, isFocused]);
    return (
        <Container>
            <FlatList
                data={sortedTokens()}
                keyExtractor={defaultKeyExtractor}
                renderItem={renderItem}
                refreshing={updating}
                onRefresh={update}
                ListHeaderComponent={<ListHeader />}
            />
        </Container>
    );
};

AssetsScreen.navigationOptions = ({ navigation }) => ({
    headerRight: (
        <Button rounded={true} transparent={true} onPress={navigation.getParam("onSort")}>
            <Icon type="MaterialIcons" name="sort" style={preset.colorPrimary} />
        </Button>
    )
});

AssetsScreen.pendingWithdrawalCount = null;

const useTokenSorter = () => {
    const [sortedByName, setSortedByName] = useState(false);
    const { assets } = useContext(AssetContext);
    const { getBalance } = useContext(BalancesContext);
    const sortedTokens = useCallback(() => {
        if (sortedByName) {
            return assets.sort((t1, t2) => t1.symbol.localeCompare(t2.symbol));
        } else {
            return assets.sort((t1, t2) =>
                getBalance(t1.ethereumAddress)
                    .add(getBalance(t1.loomAddress))
                    .sub(getBalance(t2.ethereumAddress).add(getBalance(t2.loomAddress)))
                    .div(pow10(18 - ERC20_MAX_PRECISION))
                    .toNumber()
            );
        }
    }, [assets]);
    return { sortedByName, setSortedByName, sortedTokens };
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

const ListHeader = () => {
    const { t } = useTranslation("asset");
    return (
        <View>
            <ClosingView />
            <TitleText aboveText={true}>{t("myAssets")}</TitleText>
            {/*<CaptionText style={preset.marginBottomLarge}>{t("myAssets.description")}</CaptionText>*/}
        </View>
    );
};

const styles = StyleSheet.create({
    tokenIcon: { flex: 0, marginLeft: Spacing.small, paddingRight: Spacing.normal }
});

export default AssetsScreen;
