import React, { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

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
import ERC20Token from "../../../evm/ERC20Token";
import useEthereumBlockNumberListener from "../../../hooks/useEthereumBlockNumberListener";
import useGatewayReceivedLoader from "../../../hooks/useGatewayReceivedLoader";
import useGatewayTokenWithdrawnLoader from "../../../hooks/useGatewayTokenWithdrawnLoader";
import usePendingWithdrawalListener from "../../../hooks/usePendingWithdrawalListener";
import useTokenBalanceUpdater from "../../../hooks/useTokenBalanceUpdater";
import preset from "../../../styles/preset";
import { formatValue, toBigNumber } from "../../../utils/big-number-utils";
import { openTx } from "../../../utils/ether-scan-utils";

const ManageAssetScreen = () => {
    const { t } = useTranslation(["asset", "profile", "common"]);
    const { push, getParam } = useNavigation();
    const asset: ERC20Token = getParam("asset");
    const { getBalance } = useContext(BalancesContext);
    const { loadReceived, received } = useGatewayReceivedLoader(asset.ethereumAddress);
    const { loadWithdrawn, withdrawn } = useGatewayTokenWithdrawnLoader(asset.ethereumAddress);
    const { blockNumber } = useEthereumBlockNumberListener();
    const { update } = useTokenBalanceUpdater();
    const { receipt } = usePendingWithdrawalListener(asset);
    const loomBalance = getBalance(asset.loomAddress);
    const ethereumBalance = getBalance(asset.ethereumAddress);
    const renderItem = ({ item }) => <ItemView asset={asset} item={item} blockNumber={blockNumber} />;
    const items = [...(received || []), ...(withdrawn || [])].sort(
        (l1, l2) => (l2.blockNumber || 0) - (l1.blockNumber || 0)
    );
    useEffect(() => {
        const refresh = async () => {
            await Promise.all([loadReceived(), loadWithdrawn()]);
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

const TokenView = ({ asset }: { asset: ERC20Token }) => {
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

const PendingWithdrawalItemView = ({ asset, receipt }: { asset: ERC20Token; receipt: IWithdrawalReceipt }) => {
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

const ItemView = ({ asset, item, blockNumber }: { asset: ERC20Token; item: any; blockNumber: number | null }) => {
    const { t } = useTranslation("asset");
    const withdraw = !!item.value;
    const inProgress = !withdraw && blockNumber && item.blockNumber && blockNumber - item.blockNumber <= 15;
    const color = inProgress ? platform.brandWarning : withdraw ? platform.brandDanger : platform.brandInfo;
    return (
        <ListItem noBorder={true} onPress={useCallback(() => openTx(item.transactionHash), [])}>
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
