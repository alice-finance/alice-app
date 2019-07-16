import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, InteractionManager, View } from "react-native";
import { useFocusState, useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import {
    ERC20Received,
    ERC20Withdrawn,
    ETHReceived,
    ETHWithdrawn
} from "@alice-finance/alice.js/dist/chains/EthereumChain";
import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { Button, Container, Content, Text } from "native-base";
import BalanceView from "../../../components/BalanceView";
import CaptionText from "../../../components/CaptionText";
import EmptyView from "../../../components/EmptyView";
import HeadlineText from "../../../components/HeadlineText";
import TokenIcon from "../../../components/TokenIcon";
import TransactionLogListItem from "../../../components/TransactionLogListItem";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ChainContext } from "../../../contexts/ChainContext";
import { TokenSwapped } from "../../../hooks/useKyberSwap";
import useLogLoader from "../../../hooks/useLogLoader";
import preset from "../../../styles/preset";

const ManageAssetScreen = () => {
    const { t } = useTranslation(["asset", "profile", "common"]);
    const { push, getParam } = useNavigation();
    const { isFocused } = useFocusState();
    const asset: ERC20Asset = getParam("asset");
    const { ethereumChain } = useContext(ChainContext);
    const [] = useState(false);
    const { getCached } = useLogLoader(asset);
    const { getBalance } = useContext(BalancesContext);
    const [blockNumber, setBlockNumber] = useState(0);
    const balance = getBalance(asset.loomAddress);
    const [items, setItems] = useState<Array<
        ETHReceived | ERC20Received | ETHWithdrawn | ERC20Withdrawn | TokenSwapped
    > | null>(null);
    const renderItem = ({ item }) => <TransactionLogListItem asset={asset} item={item} blockNumber={blockNumber} />;

    useEffect(() => {
        InteractionManager.runAfterInteractions(async () => {
            const cachedItems = await getCached();
            const newItems = cachedItems
                .sort((l1, l2) => (l2.log.blockNumber || 0) - (l1.log.blockNumber || 0))
                .slice(0, 5);
            setItems(newItems);
        });
    }, []);

    useEffect(() => {
        if (isFocused && ethereumChain != null) {
            ethereumChain
                .getProvider()
                .getBlockNumber()
                .then(setBlockNumber);
        }
    }, [isFocused, ethereumChain]);

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
                    <HeadlineText aboveText={true}>{t("myAssetsInAliceNetwork")}</HeadlineText>
                    <CaptionText>{t("myAssetsInAliceNetwork.description")}</CaptionText>
                    <View
                        style={[
                            preset.alignCenter,
                            preset.flexDirectionColumn,
                            preset.alignItemsCenter,
                            preset.marginTopNormal
                        ]}>
                        <BalanceView asset={asset} balance={balance} />
                        <Text style={[preset.marginLeftTiny, preset.fontSize24]}>{t("deposited")}</Text>
                    </View>
                    <Button
                        primary={true}
                        rounded={true}
                        transparent={true}
                        style={preset.alignFlexEnd}
                        onPress={useCallback(() => push("ManageDeposits", { asset }), [asset])}>
                        <Text>{t("manageDepositedAmount")}</Text>
                    </Button>
                    <HeadlineText aboveText={true}>{t("latestTransactions")}</HeadlineText>
                    <FlatList
                        data={items}
                        keyExtractor={defaultKeyExtractor}
                        renderItem={renderItem}
                        ListEmptyComponent={<EmptyView />}
                    />
                </Content>
            </Container>
        );
    } else {
        return <Container />;
    }
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

export default ManageAssetScreen;
