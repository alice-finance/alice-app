import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clipboard, FlatList, View } from "react-native";
import { Dialog, Portal } from "react-native-paper";
import { useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import { Body, Button, Container, Content, Fab, Icon, Left, ListItem, Text, Toast } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import BigNumberText from "../../../components/BigNumberText";
import CaptionText from "../../../components/CaptionText";
import DepositInProgress from "../../../components/DepositInProgress";
import DepositSlider from "../../../components/DepositSlider";
import EmptyView from "../../../components/EmptyView";
import HeadlineText from "../../../components/HeadlineText";
import Spinner from "../../../components/Spinner";
import SubtitleText from "../../../components/SubtitleText";
import TokenIcon from "../../../components/TokenIcon";
import WithdrawalInProgress from "../../../components/WithdrawalInProgress";
import { Spacing } from "../../../constants/dimension";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { ConnectorContext } from "../../../contexts/ConnectorContext";
import { PendingTransactionsContext } from "../../../contexts/PendingTransactionsContext";
import ERC20Token from "../../../evm/ERC20Token";
import useGatewayReceivedLoader from "../../../hooks/useGatewayReceivedLoader";
import useGatewayTokenWithdrawnLoader from "../../../hooks/useGatewayTokenWithdrawnLoader";
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/big-number-utils";

const ManageAssetScreen = () => {
    const { t } = useTranslation(["asset", "profile", "common"]);
    const { ethereumConnector } = useContext(ConnectorContext);
    const { getParam } = useNavigation();
    const asset: ERC20Token = getParam("token");
    const [dialogOpen, setDialogOpen] = useState(false);
    const { getPendingDepositTransactions, getPendingWithdrawalTransactions } = useContext(PendingTransactionsContext);
    const { loadReceived, received } = useGatewayReceivedLoader(asset.ethereumAddress);
    const { loadWithdrawn, withdrawn } = useGatewayTokenWithdrawnLoader(asset.ethereumAddress);
    const pendingDepositTransactions = getPendingDepositTransactions(asset.ethereumAddress);
    const pendingWithdrawalTransactions = getPendingWithdrawalTransactions(asset.loomAddress);
    const inProgress = pendingDepositTransactions.length > 0 || pendingWithdrawalTransactions.length > 0;
    const renderItem = ({ item }) => <ItemView asset={asset} item={item} />;
    const myAddress = ethereumConnector!.address.toLocalAddressString();
    const openDialog = useCallback(() => setDialogOpen(true), []);
    const closeDialog = useCallback(() => setDialogOpen(false), []);
    const onOk = useCallback(() => {
        setDialogOpen(false);
        Clipboard.setString(myAddress);
        Toast.show({ text: t("profile:addressCopiedToTheClipboard") });
    }, [ethereumConnector]);
    useEffect(() => {
        loadReceived();
        loadWithdrawn();
    }, [inProgress]);
    if (asset) {
        return (
            <Container>
                <Content>
                    <TokenView token={asset} />
                    <HeadlineText aboveText={true}>{t("amountDeposited")}</HeadlineText>
                    <CaptionText small={true}>{t("amountDeposited.description")}</CaptionText>
                    <View style={preset.marginNormal}>
                        {inProgress ? (
                            <View style={[preset.marginBottomLarge, preset.paddingNormal]}>
                                <DepositInProgress token={asset} />
                                <WithdrawalInProgress token={asset} />
                            </View>
                        ) : (
                            <DepositSlider token={asset} />
                        )}
                    </View>
                    <HeadlineText aboveText={true}>{t("depositWithdrawalHistory")}</HeadlineText>
                    {received && withdrawn ? (
                        <FlatList
                            data={[...received, ...withdrawn]}
                            keyExtractor={defaultKeyExtractor}
                            renderItem={renderItem}
                            ListEmptyComponent={<EmptyView />}
                        />
                    ) : (
                        <Spinner compact={true} />
                    )}
                </Content>
                <Fab
                    active={true}
                    containerStyle={{ borderRadius: 28, overflow: "hidden", elevation: 8 }}
                    style={{ backgroundColor: platform.brandPrimary }}
                    position="bottomRight"
                    onPress={openDialog}>
                    <Icon type="AntDesign" name="plus" />
                </Fab>
                <MyAddressDialog visible={dialogOpen} onCancel={closeDialog} onOk={onOk} address={myAddress} />
            </Container>
        );
    } else {
        return <Container />;
    }
};

const TokenView = ({ token }: { token: ERC20Token }) => {
    const { getBalance } = useContext(BalancesContext);
    return (
        <View style={{ alignItems: "center", margin: Spacing.normal }}>
            <TokenIcon
                address={token.ethereumAddress.toLocalAddressString()}
                width={72}
                height={72}
                style={{ marginLeft: Spacing.small, flex: 0 }}
            />
            <SubtitleText aboveText={true}>{token.name}</SubtitleText>
            <CaptionText>
                {formatValue(getBalance(token.loomAddress).add(getBalance(token.ethereumAddress)), token.decimals, 2)}{" "}
                {token.symbol}
            </CaptionText>
        </View>
    );
};

const ItemView = ({ asset, item }: { asset: ERC20Token; item: any }) => {
    const { t } = useTranslation("asset");
    const withdraw = !!item.value;
    return (
        <ListItem noBorder={true}>
            <Left style={[preset.flex0]}>
                <TypeBadge color={withdraw ? platform.brandDanger : platform.brandInfo} />
            </Left>
            <Body style={[preset.flex1, preset.marginLeftSmall]}>
                <Text note={true} style={[preset.padding0, preset.marginLeftSmall]}>
                    {withdraw ? t("withdrawal") : t("deposit")}
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

const TypeBadge = ({ color }) => {
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
            <Icon type="MaterialIcons" name={"check"} style={{ fontSize: 18, color, alignSelf: "center" }} />
        </View>
    );
};

const MyAddressDialog = ({ visible, onCancel, onOk, address }) => {
    const { t } = useTranslation(["profile", "common"]);
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onCancel}>
                <Dialog.Content>
                    <HeadlineText>{t("myAddress")}</HeadlineText>
                    <CaptionText small={true}>{t("myAddress.description")}</CaptionText>
                    <Text style={[preset.textAlignCenter, preset.marginLarge, preset.colorInfo]}>{address}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button rounded={true} transparent={true} onPress={onCancel}>
                        <Text>{t("common:cancel")}</Text>
                    </Button>
                    <Button rounded={true} transparent={true} onPress={onOk}>
                        <Text>{t("common:copy")}</Text>
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default ManageAssetScreen;
