import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { Body, Button, Container, Icon, ListItem, Text } from "native-base";
import CaptionText from "../../../components/CaptionText";
import TitleText from "../../../components/TitleText";
import TokenIcon from "../../../components/TokenIcon";
import { Spacing } from "../../../constants/dimension";
import { ERC20_MAX_PRECISION } from "../../../constants/token";
import { AssetContext } from "../../../contexts/AssetContext";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ChainContext } from "../../../contexts/ChainContext";
import useEthereumBlockNumberListener from "../../../hooks/useEthereumBlockNumberListener";
import usePendingWithdrawalHandler from "../../../hooks/usePendingWithdrawalHandler";
import useTokenBalanceUpdater from "../../../hooks/useTokenBalanceUpdater";
import preset from "../../../styles/preset";
import { formatValue, pow10 } from "../../../utils/big-number-utils";
import { mapAccounts } from "../../../utils/loom-utils";

const AssetsScreen = () => {
    const { updating, update } = useTokenBalanceUpdater();
    const { sortedByName, setSortedByName, sortedTokens } = useTokenSorter();
    const { handlePendingWithdrawal } = usePendingWithdrawalHandler();
    const { blockNumber } = useEthereumBlockNumberListener();
    const { loomChain, ethereumChain } = useContext(ChainContext);
    const { push, setParams } = useNavigation();
    const onSort = useCallback(() => setSortedByName(!sortedByName), [sortedByName]);
    const onPress = useCallback((asset: ERC20Asset) => push("ManageAsset", { asset }), []);
    const renderItem = useCallback(({ item }) => <TokenListItem token={item} onPress={onPress} />, []);
    useEffect(() => {
        setParams({ onSort });
        mapAccounts(ethereumChain!, loomChain!);
        update();
    }, []);

    useEffect(() => {
        if (blockNumber && blockNumber % 4 === 0) {
            Promise.all([update(), handlePendingWithdrawal()]);
        }
    }, [blockNumber]);
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
    return (
        <ListItem button={true} noBorder={true} iconRight={true} onPress={useCallback(() => onPress(token), [token])}>
            <Body style={styles.tokenIcon}>
                <TokenIcon address={token.ethereumAddress.toLocalAddressString()} width={32} height={32} />
            </Body>
            <Body style={preset.flex0}>
                <Text style={preset.fontSize20}>{token.symbol}</Text>
                <Text note={true} style={{ color: "darkgrey" }}>
                    {token.name}
                </Text>
            </Body>
            <Body style={preset.flex1}>
                <Text style={[preset.fontSize20, preset.textAlignRight, preset.colorDarkGrey, preset.marginRightTiny]}>
                    {formatValue(
                        getBalance(token.ethereumAddress).add(getBalance(token.loomAddress)),
                        token.decimals,
                        2
                    )}
                </Text>
            </Body>
            <Icon type="MaterialIcons" name="chevron-right" style={preset.colorPrimary} />
        </ListItem>
    );
};

const ListHeader = () => {
    const { t } = useTranslation("asset");
    return (
        <View>
            <TitleText aboveText={true}>{t("myAssets")}</TitleText>
            <CaptionText style={preset.marginBottomLarge}>{t("myAssets.description")}</CaptionText>
        </View>
    );
};

const styles = StyleSheet.create({
    tokenIcon: { flex: 0, marginLeft: Spacing.small, paddingRight: Spacing.normal }
});

export default AssetsScreen;
