import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import {
    ERC20Received,
    ERC20Withdrawn,
    ETHReceived,
    ETHWithdrawn
} from "@alice-finance/alice.js/dist/chains/EthereumChain";
import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { toBigNumber } from "@alice-finance/alice.js/dist/utils/big-number-utils";
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway";
import { Body, Button, Container, Content, Icon, Left, ListItem, Text } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import BalanceView from "../../../components/BalanceView";
import BigNumberText from "../../../components/BigNumberText";
import CaptionText from "../../../components/CaptionText";
import EmptyView from "../../../components/EmptyView";
import HeadlineText from "../../../components/HeadlineText";
import Spinner from "../../../components/Spinner";
import TokenIcon from "../../../components/TokenIcon";
import { AssetContext } from "../../../contexts/AssetContext";
import { BalancesContext } from "../../../contexts/BalancesContext";
import useEthereumBlockNumberListener from "../../../hooks/useEthereumBlockNumberListener";
import useKyberSwap, { TokenSwapped } from "../../../hooks/useKyberSwap";
import useLogLoader from "../../../hooks/useLogLoader";
import usePendingWithdrawalListener from "../../../hooks/usePendingWithdrawalListener";
import useTokenBalanceUpdater from "../../../hooks/useTokenBalanceUpdater";
import preset from "../../../styles/preset";
import { openTx } from "../../../utils/ether-scan-utils";

const ManageAssetScreen = () => {
    const { t } = useTranslation(["asset", "profile", "common"]);
    const { push, getParam } = useNavigation();
    const asset: ERC20Asset = getParam("asset");
    const { getBalance } = useContext(BalancesContext);
    const [swapped, setSwapped] = useState<TokenSwapped[]>();
    const [received, setReceived] = useState<ETHReceived[] | ERC20Received[]>();
    const [withdrawn, setWithdrawn] = useState<ETHWithdrawn[] | ERC20Withdrawn[]>();
    const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
    const { blockNumber } = useEthereumBlockNumberListener();
    const { update } = useTokenBalanceUpdater();
    const { getGatewayDepositLogs, getGatewayWithdrawLogs, getKyberSwapLogs } = useLogLoader(asset);
    const { receipt } = usePendingWithdrawalListener(asset);
    const { ready } = useKyberSwap();
    const renderItem = ({ item }) => <ItemView asset={asset} item={item} blockNumber={blockNumber} />;
    const [items, setItems] = useState<Array<
        ETHReceived | ERC20Received | ETHWithdrawn | ERC20Withdrawn | TokenSwapped
    > | null>(null);
    const balance = getBalance(asset.loomAddress);

    useEffect(() => {
        refreshLog();
    }, [blockNumber]);

    useEffect(() => {
        setReceived(undefined);
        setWithdrawn(undefined);
        setSwapped(undefined);
        if (ready) {
            refreshLog();
        }
    }, [ready, asset]);

    useEffect(() => {
        const newItems = [...(received || []), ...(withdrawn || []), ...(swapped || [])].sort(
            (l1, l2) => (l2.log.blockNumber || 0) - (l1.log.blockNumber || 0)
        );
        setItems(newItems);
    }, [received, withdrawn, swapped]);

    const refreshLog = useCallback(async () => {
        if (!isRefreshingLogs) {
            setIsRefreshingLogs(true);
            Promise.all([
                getGatewayDepositLogs().then(setReceived),
                getGatewayWithdrawLogs().then(setWithdrawn),
                getKyberSwapLogs().then(setSwapped)
            ]);

            await update();
            setIsRefreshingLogs(false);
        }
    }, [asset, isRefreshingLogs, setIsRefreshingLogs, getGatewayDepositLogs, getGatewayWithdrawLogs, getKyberSwapLogs]);

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
                    <View style={preset.flexDirectionRow}>
                        <BalanceView
                            style={[preset.alignCenter, preset.marginTopNormal]}
                            asset={asset}
                            balance={balance}
                        />
                        <Text style={[preset.fontSize24]}>{t("deposited")}</Text>
                    </View>
                    <Button
                        primary={true}
                        rounded={true}
                        transparent={true}
                        style={preset.alignFlexEnd}
                        onPress={useCallback(() => push("ManageDeposits", { asset }), [asset])}>
                        <Text>{t("manageDepositedAmount")}</Text>
                    </Button>
                    <HeadlineText aboveText={true}>{t("pendingTransactions")}</HeadlineText>
                    {received && withdrawn && swapped ? (
                        <>
                            {receipt && <PendingWithdrawalItemView asset={asset} receipt={receipt} />}
                            <FlatList
                                data={items}
                                keyExtractor={defaultKeyExtractor}
                                renderItem={renderItem}
                                ListEmptyComponent={<EmptyView />}
                            />
                        </>
                    ) : (
                        <Spinner compact={true} />
                    )}
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

const PendingWithdrawalItemView = ({ asset, receipt }: { asset: ERC20Asset; receipt: IWithdrawalReceipt }) => {
    const { t } = useTranslation("asset");
    const color = platform.brandWarning;
    return (
        <ListItem noBorder={true}>
            <Left style={[preset.flex0]}>
                <TypeBadge inProgress={true} color={color} withdraw={true} />
            </Left>
            <Body style={[preset.flex1, preset.marginLeftSmall]}>
                <Text note={true} style={[preset.padding0, preset.marginLeftSmall]}>
                    {t("withdrawal")} ({t("processing")})
                </Text>
                <BigNumberText
                    value={toBigNumber(receipt.tokenAmount.toString())}
                    style={[preset.marginLeftSmall, preset.fontSize20]}
                    suffix={" " + asset.symbol}
                />
            </Body>
        </ListItem>
    );
};

const ItemView = ({ asset, item, blockNumber }: { asset: ERC20Asset; item: any; blockNumber: number | null }) => {
    const { t } = useTranslation("asset");
    const { getAssetByEthereumAddress } = useContext(AssetContext);
    const withdraw = !!item.value;
    const swap = !!item.actualDestAmount;
    const inProgress = !withdraw && blockNumber && item.log.blockNumber && blockNumber - item.log.blockNumber <= 15;
    const color = inProgress ? platform.brandWarning : withdraw ? platform.brandDanger : platform.brandInfo;
    const symbol = swap && getAssetByEthereumAddress(item.dest) ? getAssetByEthereumAddress(item.dest)!.symbol : "";
    return (
        <ListItem
            noBorder={true}
            onPress={useCallback(() => openTx(item.log.transactionHash), [item.log.transactionHash])}>
            <Left style={[preset.flex0]}>
                <TypeBadge inProgress={inProgress} color={color} withdraw={withdraw} />
            </Left>
            <Body style={[preset.flex1, preset.marginLeftSmall]}>
                <Text note={true} style={[preset.padding0, preset.marginLeftSmall]}>
                    {withdraw ? t("withdrawal") : swap ? t("tokenConversion") : t("deposit")}{" "}
                    {inProgress && " (" + t("processing") + ")"}
                </Text>
                {!swap ? (
                    <BigNumberText
                        value={item.amount || item.value}
                        style={[preset.marginLeftSmall, preset.fontSize20]}
                        suffix={" " + asset.symbol}
                    />
                ) : (
                    <View style={{ flexDirection: "row" }}>
                        <BigNumberText
                            value={item.actualSrcAmount}
                            style={[preset.marginLeftSmall, preset.fontSize20]}
                            suffix={" " + asset.symbol}
                        />
                        <Icon
                            type="AntDesign"
                            name="arrowright"
                            style={[preset.fontSize20, preset.alignCenter, preset.marginLeftSmall]}
                        />
                        <BigNumberText
                            value={item.actualDestAmount}
                            style={[preset.marginLeftSmall, preset.fontSize20]}
                            suffix={" " + symbol}
                        />
                    </View>
                )}
            </Body>
        </ListItem>
    );
};

const TypeBadge = ({ color, inProgress, withdraw }) => {
    return (
        <View
            style={{
                borderColor: color,
                borderWidth: platform.borderWidth * 2,
                width: 48,
                height: 48,
                borderRadius: 24,
                paddingTop: 14
            }}>
            <Icon
                type="AntDesign"
                name={inProgress ? "hourglass" : withdraw ? "arrowleft" : "arrowright"}
                style={[preset.fontSize20, preset.alignCenter, { color }]}
            />
        </View>
    );
};

export default ManageAssetScreen;
