import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useFocusState, useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { Button, Container, Content, Icon, Text } from "native-base";
import BalanceView from "../../../components/BalanceView";
import CaptionText from "../../../components/CaptionText";
import EmptyView from "../../../components/EmptyView";
import HeadlineText from "../../../components/HeadlineText";
import Spinner from "../../../components/Spinner";
import TokenIcon from "../../../components/TokenIcon";
import TransactionLogListItem from "../../../components/TransactionLogListItem";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ChainContext } from "../../../contexts/ChainContext";
import useEthereumBlockNumberListener from "../../../hooks/useEthereumBlockNumberListener";
import useLogRefresher from "../../../hooks/useLogRefresher";
import preset from "../../../styles/preset";

const ManageAssetScreen = () => {
    const { t } = useTranslation(["asset", "profile", "common"]);
    const { push, getParam } = useNavigation();
    const { isFocused } = useFocusState();
    const asset: ERC20Asset = getParam("asset");
    const [] = useState(false);
    const transferable = !asset.loomAddress.isZero();

    if (asset) {
        return (
            <Container>
                <Content>
                    <TokenView asset={asset} />
                    <View style={[preset.flexDirectionRow, preset.marginNormal]}>
                        <Button
                            primary={true}
                            rounded={true}
                            block={true}
                            style={[preset.flex1, preset.marginTiny]}
                            onPress={useCallback(() => push("MyAddress"), [asset])}>
                            <Text>{t("receive")}</Text>
                        </Button>
                        <Button
                            primary={true}
                            bordered={true}
                            rounded={true}
                            block={true}
                            style={[preset.flex1, preset.marginTiny]}
                            onPress={useCallback(() => push("TransferAsset", { asset }), [asset])}>
                            <Text>{t("send")}</Text>
                        </Button>
                    </View>
                    {transferable ? (
                        <TransferableAssetView asset={asset} isFocused={isFocused} />
                    ) : (
                        <NotTransferableAssetView />
                    )}
                </Content>
            </Container>
        );
    } else {
        return <Container />;
    }
};

interface TransferableAssetViewProps {
    asset: ERC20Asset;
    isFocused: boolean;
}

const TransferableAssetView = ({ asset, isFocused }: TransferableAssetViewProps) => {
    const { push } = useNavigation();
    const { t } = useTranslation(["asset", "profile", "common"]);
    const { getBalance } = useContext(BalancesContext);
    const balance = getBalance(asset.loomAddress);
    return (
        <View>
            <HeadlineText aboveText={true}>{t("myAssetsInAliceNetwork")}</HeadlineText>
            <CaptionText>{t("myAssetsInAliceNetwork.description")}</CaptionText>
            <View style={balanceWrapperStyle}>
                <BalanceView asset={asset} balance={balance} />
            </View>
            <Button
                primary={true}
                rounded={true}
                transparent={true}
                iconRight={true}
                style={preset.alignFlexEnd}
                onPress={useCallback(() => push("ManageDeposits", { asset }), [asset])}>
                <Text style={{ paddingRight: 0 }}>{t("manageAssetsInAliceNetwork")}</Text>
                <Icon type={"MaterialIcons"} name={"keyboard-arrow-right"} />
            </Button>
            <HeadlineText aboveText={true}>{t("latestTransactions")}</HeadlineText>
            <LogsView asset={asset} isFocused={isFocused} />
        </View>
    );
};

const NotTransferableAssetView = () => {
    const { t } = useTranslation(["asset", "profile", "common"]);
    return (
        <View>
            <HeadlineText aboveText={true}>{t("assetNotTransferable")}</HeadlineText>
            <CaptionText>{t("assetNotTransferable.description")}</CaptionText>
        </View>
    );
};

const LogsView = ({ asset, isFocused }: { asset: ERC20Asset; isFocused: boolean }) => {
    const { ethereumChain } = useContext(ChainContext);
    const { blockNumber } = useEthereumBlockNumberListener();
    const { items, refreshLogs } = useLogRefresher(asset);
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

const balanceWrapperStyle = [
    preset.alignCenter,
    preset.flexDirectionColumn,
    preset.alignItemsCenter,
    preset.marginTopLarge,
    preset.marginBottomNormal
];

export default ManageAssetScreen;
