import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../../utils/react-native-utils";

import { Body, Container, Content, Icon, Left, ListItem, Text } from "native-base";
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
import { PendingTransactionsContext } from "../../../contexts/PendingTransactionsContext";
import ERC20Token from "../../../evm/ERC20Token";
import useGatewayReceivedLoader from "../../../hooks/useGatewayReceivedLoader";
import useGatewayTokenWithdrawnLoader from "../../../hooks/useGatewayTokenWithdrawnLoader";
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/big-number-utils";

const ManageAssetScreen = () => {
    const { t } = useTranslation(["asset", "common"]);
    const { getParam } = useNavigation();
    const asset: ERC20Token = getParam("token");
    const { getPendingDepositTransactions, getPendingWithdrawalTransactions } = useContext(PendingTransactionsContext);
    const { loadReceived, received } = useGatewayReceivedLoader(asset.ethereumAddress);
    const { loadWithdrawn, withdrawn } = useGatewayTokenWithdrawnLoader(asset.ethereumAddress);
    const pendingDepositTransactions = getPendingDepositTransactions(asset.ethereumAddress);
    const pendingWithdrawalTransactions = getPendingWithdrawalTransactions(asset.loomAddress);
    const inProgress = pendingDepositTransactions.length > 0 || pendingWithdrawalTransactions.length > 0;
    const renderItem = ({ item }) => <ItemView asset={asset} item={item} />;
    useEffect(() => {
        loadReceived();
        loadWithdrawn();
    }, [inProgress]);
    if (asset) {
        return (
            <Container>
                <Content>
                    <TokenView token={asset} />
                    <HeadlineText aboveText={true}>{t("depositAmount")}</HeadlineText>
                    <CaptionText small={true}>{t("depositAmount.description")}</CaptionText>
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

export default ManageAssetScreen;
