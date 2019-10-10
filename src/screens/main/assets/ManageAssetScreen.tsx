import React, { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useFocusState, useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { Button, Card, Container, Content, Icon, Text } from "native-base";
import BalanceView from "../../../components/BalanceView";
import EmptyView from "../../../components/EmptyView";
import Spinner from "../../../components/Spinner";
import CaptionText from "../../../components/texts/CaptionText";
import HeadlineText from "../../../components/texts/HeadlineText";
import TokenIcon from "../../../components/TokenIcon";
import TransactionLogListItem from "../../../components/TransactionLogListItem";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ChainContext } from "../../../contexts/ChainContext";
import useEthereumBlockNumberListener from "../../../hooks/useEthereumBlockNumberListener";
import useLogRefresher from "../../../hooks/useLogRefresher";
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/big-number-utils";

const ManageAssetScreen = () => {
    const { t } = useTranslation(["asset", "profile", "common"]);
    const { getParam } = useNavigation();
    const asset: ERC20Asset = getParam("asset");
    return (
        <Container>
            <Content>
                <TokenView asset={asset!} />
                <View style={[preset.flexDirectionRow, preset.marginNormal]}>
                    <ReceiveButton asset={asset!} />
                    <SendButton asset={asset!} />
                </View>
                <TransferIssueCard asset={asset!} />
                <HeadlineText aboveText={true}>{t("latestTransactions")}</HeadlineText>
                <LatestTransactionList asset={asset} />
            </Content>
        </Container>
    );
};

const ReceiveButton = ({ asset }) => {
    const { t } = useTranslation("asset");
    const { push } = useNavigation();
    return (
        <Button
            primary={true}
            rounded={true}
            block={true}
            style={[preset.flex1, preset.marginTiny]}
            onPress={useCallback(() => push("MyAddress"), [asset])}>
            <Text>{t("receive")}</Text>
        </Button>
    );
};

const SendButton = ({ asset }) => {
    const { t } = useTranslation("asset");
    const { push } = useNavigation();
    return (
        <Button
            primary={true}
            bordered={true}
            rounded={true}
            block={true}
            style={[preset.flex1, preset.marginTiny]}
            onPress={useCallback(() => push("TransferAsset", { asset }), [asset])}>
            <Text>{t("send")}</Text>
        </Button>
    );
};

const TransferIssueCard = ({ asset }) => {
    const { t } = useTranslation("asset");
    const { getBalance } = useContext(BalancesContext);
    const ethereumBalance = getBalance(asset.ethereumAddress);
    const noIssue = ethereumBalance.isZero();
    return (
        <View style={preset.marginNormal}>
            <Card>
                <View>
                    <HeadlineText aboveText={true}>{t(noIssue ? "noIssue" : "issueFound")}</HeadlineText>
                    <CaptionText>{t(noIssue ? "noIssue.description" : "issueFound.description")}</CaptionText>
                    {!noIssue && (
                        <View style={[preset.flexDirectionRow, preset.justifyContentFlexEnd, preset.marginRightLarge]}>
                            <Text style={[preset.fontSize24]}>{formatValue(ethereumBalance, asset.decimals)}</Text>
                            <Text style={[preset.fontSize24, preset.marginLeftSmall]}>{asset.symbol}</Text>
                        </View>
                    )}
                    <TransferButton asset={asset} />
                </View>
            </Card>
        </View>
    );
};

const TransferButton = ({ asset }) => {
    const { t } = useTranslation("asset");
    const { push } = useNavigation();
    return (
        <Button
            primary={true}
            rounded={true}
            transparent={true}
            iconRight={true}
            style={[preset.alignFlexEnd, preset.marginBottomSmall]}
            onPress={useCallback(() => push("ManageDeposits", { asset }), [asset])}>
            <Text style={{ paddingRight: 0 }}>{t("transferAssets")}</Text>
            <Icon type={"MaterialIcons"} name={"keyboard-arrow-right"} />
        </Button>
    );
};

const TokenView = ({ asset }: { asset: ERC20Asset }) => {
    const { getBalance } = useContext(BalancesContext);
    const balance = getBalance(asset.loomAddress).add(getBalance(asset.ethereumAddress));
    return (
        <View style={[preset.flexDirectionRow, preset.justifyContentCenter, preset.alignItemsCenter]}>
            <TokenIcon
                address={asset.ethereumAddress.toLocalAddressString()}
                width={64}
                height={64}
                style={preset.marginNormal}
            />
            <View style={preset.marginRightNormal}>
                <BalanceView style={preset.justifyContentCenter} asset={asset} balance={balance} />
                <Text style={[preset.fontSize16, preset.colorGrey]}>{asset.name}</Text>
            </View>
        </View>
    );
};

const LatestTransactionList = ({ asset }) => {
    const { ethereumChain } = useContext(ChainContext);
    const { items, refreshLogs } = useLogRefresher(asset);
    const { isFocused } = useFocusState();
    const { blockNumber } = useEthereumBlockNumberListener();
    const renderItem = ({ item }) => <TransactionLogListItem asset={asset} item={item} blockNumber={blockNumber} />;
    useEffect(() => {
        if (isFocused && ethereumChain != null) {
            refreshLogs();
        }
    }, [isFocused, ethereumChain]);
    return items ? (
        <FlatList
            data={items.slice(0, 5)}
            keyExtractor={defaultKeyExtractor}
            renderItem={renderItem}
            ListEmptyComponent={<EmptyView />}
        />
    ) : (
        <Spinner compact={true} />
    );
};

export default ManageAssetScreen;
