import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Body, Button, Container, Icon, ListItem, Text } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import CaptionText from "../../../components/CaptionText";
import TitleText from "../../../components/TitleText";
import TokenIcon from "../../../components/TokenIcon";
import { Spacing } from "../../../constants/dimension";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { TokensContext } from "../../../contexts/TokensContext";
import { WalletContext } from "../../../contexts/WalletContext";
import ERC20Token from "../../../evm/ERC20Token";
import { formatValue, toBN } from "../../../utils/erc20-utils";

const AssetsScreen = () => {
    const { refreshing, onRefresh } = useTokensUpdater();
    const { sortedByName, setSortedByName, sortedTokens } = useTokenSorter();
    const { push, setParams } = useNavigation();
    const onSort = useCallback(() => setSortedByName(!sortedByName), [sortedByName]);
    const onPress = useCallback(token => push("ManageAsset", { tokenAddress: token.address }), []);
    const renderItem = useCallback(({ item }) => <TokenListItem token={item} onPress={onPress} />, []);
    useEffect(() => {
        setParams({ onSort });
        onRefresh();
    }, []);
    return (
        <Container>
            <FlatList
                data={sortedTokens()}
                keyExtractor={useCallback((item, index) => index.toString(), [])}
                renderItem={renderItem}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListHeaderComponent={<ListHeader />}
            />
        </Container>
    );
};

AssetsScreen.navigationOptions = ({ navigation }) => ({
    headerRight: (
        <Button rounded={true} transparent={true} onPress={navigation.getParam("onSort")}>
            <Icon type="MaterialIcons" name="sort" style={{ color: platform.brandPrimary }} />
        </Button>
    )
});

const useTokensUpdater = () => {
    const { setTokens } = useContext(TokensContext);
    const { loomWallet } = useContext(WalletContext);
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            if (loomWallet) {
                setTokens(await loomWallet.fetchERC20Tokens());
                // TODO: update balances
            }
        } finally {
            setRefreshing(false);
        }
    }, []);
    return { refreshing, onRefresh };
};

const useTokenSorter = () => {
    const [sortedByName, setSortedByName] = useState(false);
    const { tokens } = useContext(TokensContext);
    const { getLoomBalance, getEthereumBalance } = useContext(BalancesContext);
    const sortedTokens = useCallback(() => {
        if (sortedByName) {
            return tokens.sort((t1, t2) => t1.symbol.localeCompare(t2.symbol));
        } else {
            return tokens.sort((t1, t2) =>
                getEthereumBalance(t1.ethereumAddress.toLocalAddressString())
                    .add(getLoomBalance(t1.loomAddress.toLocalAddressString()))
                    .sub(
                        getEthereumBalance(t2.ethereumAddress.toLocalAddressString()).add(
                            getLoomBalance(t2.loomAddress.toLocalAddressString())
                        )
                    )
                    .toNumber()
            );
        }
    }, [tokens]);
    return { sortedByName, setSortedByName, sortedTokens };
};

const TokenListItem = ({ token, onPress }: { token: ERC20Token; onPress: (ERC20Token) => void }) => {
    return (
        <ListItem button={true} noBorder={true} iconRight={true} onPress={useCallback(() => onPress(token), [token])}>
            <Body style={{ flex: 0, marginLeft: Spacing.small, paddingRight: Spacing.normal }}>
                <TokenIcon address={token.ethereumAddress.toLocalAddressString()} width={32} height={32} />
            </Body>
            <Body style={{ flex: 1 }}>
                <Text style={{ fontSize: 20 }}>{token.symbol}</Text>
                <Text note={true} style={{ color: "darkgrey" }}>
                    {token.name}
                </Text>
            </Body>
            <Body style={{ flex: 0 }}>
                <Text style={{ fontSize: 20, textAlign: "right", color: "darkgrey", marginRight: Spacing.tiny }}>
                    {formatValue(toBN(0).add(toBN(0)), token.decimals, 2)}
                </Text>
            </Body>
            <Icon type="MaterialIcons" name="chevron-right" style={{ color: platform.brandPrimary }} />
        </ListItem>
    );
};

const ListHeader = () => {
    const { t } = useTranslation("asset");
    return (
        <View>
            <TitleText aboveText={true}>{t("myAssets")}</TitleText>
            <CaptionText style={{ marginBottom: Spacing.large }}>{t("myAssets.description")}</CaptionText>
        </View>
    );
};

export default AssetsScreen;
