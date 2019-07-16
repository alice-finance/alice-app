import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList } from "react-native-gesture-handler";
import { useFocusState, useNavigation } from "react-navigation-hooks";
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
import { Body, Button, Card, CardItem, Container, Content, Left, ListItem, Text, View } from "native-base";
import platform from "../../../../native-base-theme/variables/platform";
import BalanceView from "../../../components/BalanceView";
import BigNumberText from "../../../components/BigNumberText";
import CaptionText from "../../../components/CaptionText";
import EmptyView from "../../../components/EmptyView";
import HeadlineText from "../../../components/HeadlineText";
import Spinner from "../../../components/Spinner";
import TitleText from "../../../components/TitleText";
import TransactionLogListItem, { TypeBadge } from "../../../components/TransactionLogListItem";
import { BalancesContext } from "../../../contexts/BalancesContext";
import useEthereumBlockNumberListener from "../../../hooks/useEthereumBlockNumberListener";
import useKyberSwap, { TokenSwapped } from "../../../hooks/useKyberSwap";
import useLogLoader from "../../../hooks/useLogLoader";
import usePendingWithdrawalListener from "../../../hooks/usePendingWithdrawalListener";
import useTokenBalanceUpdater from "../../../hooks/useTokenBalanceUpdater";
import preset from "../../../styles/preset";

const ManageDepositsScreen = () => {
    const { t } = useTranslation("asset");
    const { getBalance } = useContext(BalancesContext);
    const { push, getParam } = useNavigation();
    const { isFocused } = useFocusState();
    const asset: ERC20Asset = getParam("asset");
    const [swapped, setSwapped] = useState<TokenSwapped[]>();
    const [received, setReceived] = useState<ETHReceived[] | ERC20Received[]>();
    const [withdrawn, setWithdrawn] = useState<ETHWithdrawn[] | ERC20Withdrawn[]>();
    const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
    const { getGatewayDepositLogs, getGatewayWithdrawLogs, getKyberSwapLogs } = useLogLoader(asset);
    const { update } = useTokenBalanceUpdater();
    const { blockNumber } = useEthereumBlockNumberListener();
    const renderItem = ({ item }) => <TransactionLogListItem asset={asset} item={item} blockNumber={blockNumber} />;
    const [items, setItems] = useState<Array<
        ETHReceived | ERC20Received | ETHWithdrawn | ERC20Withdrawn | TokenSwapped
    > | null>(null);
    const { receipt } = usePendingWithdrawalListener(asset);
    const { ready } = useKyberSwap();

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

    useEffect(() => {
        if (isFocused) {
            refreshLog();
        }
    }, [isFocused]);

    const refreshLog = useCallback(() => {
        if (!isRefreshingLogs) {
            setIsRefreshingLogs(true);
            Promise.all([
                getGatewayDepositLogs().then(setReceived),
                getGatewayWithdrawLogs().then(setWithdrawn),
                getKyberSwapLogs().then(setSwapped)
            ]).then(() => {
                update().then(() => {
                    setIsRefreshingLogs(false);
                });
            });
        }
    }, [asset, isRefreshingLogs, setIsRefreshingLogs, getGatewayDepositLogs, getGatewayWithdrawLogs, getKyberSwapLogs]);

    return (
        <Container>
            <Content>
                <TitleText aboveText={true}>{t("manageDepositedAmount")}</TitleText>
                <BalanceCard
                    title={t("ethereumWallet")}
                    description={t("ethereumWallet.description")}
                    balance={getBalance(asset.ethereumAddress)}
                    asset={asset}
                    buttonText={t("deposit")}
                    onPressButton={useCallback(() => push("Deposit", { asset }), [asset])}
                />
                <BalanceCard
                    title={t("aliceWallet")}
                    description={t("aliceWallet.description")}
                    balance={getBalance(asset.loomAddress)}
                    asset={asset}
                    buttonText={t("withdrawal")}
                    onPressButton={useCallback(() => push("Withdrawal", { asset }), [asset])}
                />
                <HeadlineText aboveText={true}>{t("transactions")}</HeadlineText>
                {received && withdrawn && swapped && blockNumber ? (
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
};

const BalanceCard = ({ title, description, balance, asset, buttonText, onPressButton }) => {
    return (
        <View style={[preset.marginNormal]}>
            <Card>
                <CardItem>
                    <View>
                        <HeadlineText aboveText={true} style={[preset.marginLeftSmall]}>
                            {title}
                        </HeadlineText>
                        <CaptionText small={true} style={preset.marginLeftSmall}>
                            {description}
                        </CaptionText>
                    </View>
                </CardItem>
                <CardItem>
                    <View style={preset.flex1}>
                        <BalanceView
                            asset={asset}
                            balance={balance}
                            style={[preset.alignCenter, preset.marginBottomSmall]}
                        />
                        <Button
                            primary={true}
                            bordered={true}
                            rounded={true}
                            onPress={onPressButton}
                            style={[preset.alignFlexEnd, preset.marginSmall]}>
                            <Text>{buttonText}</Text>
                        </Button>
                    </View>
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

export default ManageDepositsScreen;
