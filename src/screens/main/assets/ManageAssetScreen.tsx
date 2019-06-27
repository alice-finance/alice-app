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
import { IWithdrawalReceipt } from "loom-js/dist/contracts/transfer-gateway";
import { Body, Button, Card, CardItem, Container, Content, Icon, Left, ListItem, Right, Text } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import BigNumberText from "../../../components/BigNumberText";
import CaptionText from "../../../components/CaptionText";
import EmptyView from "../../../components/EmptyView";
import HeadlineText from "../../../components/HeadlineText";
import Spinner from "../../../components/Spinner";
import SubtitleText from "../../../components/SubtitleText";
import TokenIcon from "../../../components/TokenIcon";
import { Spacing } from "../../../constants/dimension";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ChainContext } from "../../../contexts/ChainContext";
import useEthereumBlockNumberListener from "../../../hooks/useEthereumBlockNumberListener";
import usePendingWithdrawalListener from "../../../hooks/usePendingWithdrawalListener";
import useTokenBalanceUpdater from "../../../hooks/useTokenBalanceUpdater";
import preset from "../../../styles/preset";
import { formatValue, toBigNumber } from "../../../utils/big-number-utils";
import { openTx } from "../../../utils/ether-scan-utils";
import StartView from "../../../components/StartView";

const ManageAssetScreen = () => {
    const { t } = useTranslation(["asset", "profile", "common"]);
    const { push, getParam } = useNavigation();
    const asset: ERC20Asset = getParam("asset");
    const { ethereumChain } = useContext(ChainContext);
    const { getBalance } = useContext(BalancesContext);
    const [received, setReceived] = useState<ETHReceived[] | ERC20Received[]>();
    const [withdrawn, setWithdrawn] = useState<ETHWithdrawn[] | ERC20Withdrawn[]>();
    const { blockNumber } = useEthereumBlockNumberListener();
    const { update } = useTokenBalanceUpdater();
    const { receipt } = usePendingWithdrawalListener(asset);
    const loomBalance = getBalance(asset.loomAddress);
    const ethereumBalance = getBalance(asset.ethereumAddress);
    const renderItem = ({ item }) => <ItemView asset={asset} item={item} blockNumber={blockNumber} />;
    const items = [...(received || []), ...(withdrawn || [])].sort(
        (l1, l2) => (l2.log.blockNumber || 0) - (l1.log.blockNumber || 0)
    );
    useEffect(() => {
        const refresh = async () => {
            if (asset.ethereumAddress.isZero()) {
                await Promise.all([
                    ethereumChain!.getETHReceivedLogsAsync().then(setReceived),
                    ethereumChain!.getETHWithdrawnLogsAsync().then(setWithdrawn)
                ]);
            } else {
                await Promise.all([
                    ethereumChain!.getERC20ReceivedLogsAsync(asset).then(setReceived),
                    ethereumChain!.getERC20WithdrawnLogsAsync(asset).then(setWithdrawn)
                ]);
            }
            await update();
        };
        refresh();
    }, [blockNumber]);
    if (asset) {
        return (
            <Container>
                <Content>
                    <TokenView asset={asset} />
                    <View style={[preset.flexDirectionRow, preset.marginNormal]}>
                        <Button
                            info={true}
                            bordered={true}
                            rounded={true}
                            block={true}
                            style={[preset.flex1, preset.marginRightSmall]}
                            onPress={useCallback(() => push("MyAddress"), [])}>
                            <Text>{t("receive")}</Text>
                        </Button>
                        <Button
                            info={true}
                            bordered={true}
                            rounded={true}
                            block={true}
                            style={preset.flex1}
                            onPress={useCallback(() => push("TransferAsset", { asset }), [])}>
                            <Text>{t("send")}</Text>
                        </Button>
                    </View>
                    <StartView style={{ marginBottom: Spacing.small }} />
                    <BalanceCard
                        title={t("ethereumWallet")}
                        description={t("ethereumWallet.description")}
                        balance={ethereumBalance}
                        asset={asset}
                        buttonText={t("deposit")}
                        onPressButton={useCallback(() => push("Deposit", { asset }), [])}
                    />
                    <BalanceCard
                        title={t("aliceWallet")}
                        description={t("aliceWallet.description")}
                        balance={loomBalance}
                        asset={asset}
                        buttonText={t("withdrawal")}
                        onPressButton={useCallback(() => push("Withdrawal", { asset }), [])}
                    />
                    <HeadlineText aboveText={true}>{t("transferHistory")}</HeadlineText>
                    {received && withdrawn ? (
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
    return (
        <View style={{ alignItems: "center", margin: Spacing.normal }}>
            <TokenIcon
                address={asset.ethereumAddress.toLocalAddressString()}
                width={72}
                height={72}
                style={{ marginLeft: Spacing.small, flex: 0 }}
            />
            <SubtitleText aboveText={true}>{asset.name}</SubtitleText>
            <CaptionText style={preset.fontSize20}>
                {formatValue(getBalance(asset.loomAddress).add(getBalance(asset.ethereumAddress)), asset.decimals, 2)}{" "}
                {asset.symbol}
            </CaptionText>
        </View>
    );
};

const BalanceCard = ({ title, description, balance, asset, buttonText, onPressButton }) => {
    return (
        <View style={[preset.marginNormal]}>
            <Card>
                <CardItem>
                    <View>
                        <View style={[preset.flex1, preset.flexDirectionRow]}>
                            <HeadlineText
                                aboveText={true}
                                style={[preset.flex1, preset.marginLeftSmall, preset.marginTopSmall]}>
                                {title}
                            </HeadlineText>
                        </View>
                        <CaptionText small={true} style={preset.marginLeftSmall}>
                            {description}
                        </CaptionText>
                    </View>
                </CardItem>
                <CardItem>
                    <View
                        style={[
                            preset.flex1,
                            preset.flexDirectionRow,
                            preset.justifyContentCenter,
                            preset.alignItemsCenter
                        ]}>
                        <Text style={[preset.marginLeftNormal, preset.marginRightSmall, preset.fontSize36]}>
                            {formatValue(balance, asset.decimals, 2)}
                        </Text>
                        <Text style={[preset.fontSize24]}>{asset.symbol}</Text>
                    </View>
                </CardItem>
                <CardItem>
                    <Left />
                    <Right>
                        <Button transparent={true} rounded={true} small={true} onPress={onPressButton}>
                            <Text style={[preset.marginTopSmall, preset.colorPrimary]}>{buttonText}</Text>
                        </Button>
                    </Right>
                </CardItem>
            </Card>
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
    const withdraw = !!item.value;
    const inProgress = !withdraw && blockNumber && item.log.blockNumber && blockNumber - item.log.blockNumber <= 15;
    const color = inProgress ? platform.brandWarning : withdraw ? platform.brandDanger : platform.brandInfo;
    return (
        <ListItem noBorder={true} onPress={useCallback(() => openTx(item.log.transactionHash), [])}>
            <Left style={[preset.flex0]}>
                <TypeBadge inProgress={inProgress} color={color} withdraw={withdraw} />
            </Left>
            <Body style={[preset.flex1, preset.marginLeftSmall]}>
                <Text note={true} style={[preset.padding0, preset.marginLeftSmall]}>
                    {withdraw ? t("withdrawal") : t("deposit")} {inProgress && " (" + t("processing") + ")"}
                </Text>
                <BigNumberText
                    value={item.amount || item.value}
                    style={[preset.marginLeftSmall, preset.fontSize20]}
                    suffix={" " + asset.symbol}
                />
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
