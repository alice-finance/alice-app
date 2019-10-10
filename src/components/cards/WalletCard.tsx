import React, { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useFocusState, useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../utils/react-native-utils";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { Button, Card, CardItem, Text } from "native-base";
import { AssetContext } from "../../contexts/AssetContext";
import { BalancesContext } from "../../contexts/BalancesContext";
import { PendingTransactionsContext } from "../../contexts/PendingTransactionsContext";
import useAssetBalancesUpdater from "../../hooks/useAssetBalancesUpdater";
import useAsyncEffect from "../../hooks/useAsyncEffect";
import useDepositionRecovery from "../../hooks/useDepositionRecovery";
import usePendingWithdrawalHandler from "../../hooks/usePendingWithdrawalHandler";
import preset from "../../styles/preset";
import { formatValue } from "../../utils/big-number-utils";
import Sentry from "../../utils/Sentry";
import RefreshButton from "../buttons/RefreshButton";
import HeadlineText from "../texts/HeadlineText";
import TokenIcon from "../TokenIcon";

const WalletCard = () => {
    const { assets } = useContext(AssetContext);
    const renderItem = useCallback(({ item }) => <AssetListItem asset={item} />, []);
    const { updating, update } = useWalletEffects();
    return (
        <View style={preset.marginNormal}>
            <Card>
                <Header updating={updating} update={update} />
                <CardItem>
                    <FlatList data={assets} keyExtractor={defaultKeyExtractor} renderItem={renderItem} />
                </CardItem>
                <Footer />
            </Card>
        </View>
    );
};

const AssetListItem = ({ asset }: { asset: ERC20Asset }) => {
    const { getBalance } = useContext(BalancesContext);
    const balance = getBalance(asset.loomAddress);
    return (
        <View style={[preset.marginLeftSmall, preset.marginRightSmall, preset.marginBottomSmall]}>
            <View style={[preset.flexDirectionRow, preset.alignItemsCenter]}>
                <TokenIcon address={asset.ethereumAddress.toLocalAddressString()} width={24} height={24} />
                <Text style={[preset.flex1, preset.marginLeftSmall, preset.fontSize20, preset.colorGrey]}>
                    {asset.name}
                </Text>
                <Text style={[preset.fontSize20, preset.fontWeightBold, preset.textAlignRight]}>
                    {formatValue(balance, asset.decimals)}
                </Text>
                <Text style={[preset.fontSize20, preset.marginLeftSmall, { width: 56 }]}>{asset.symbol}</Text>
            </View>
        </View>
    );
};

const Header = ({ updating, update }) => {
    const { t } = useTranslation("home");
    return (
        <View style={[preset.flexDirectionRow, preset.marginTopSmall]}>
            <HeadlineText style={[preset.flex1]}>{t("wallet")}</HeadlineText>
            <View>
                <RefreshButton disabled={updating} onPress={update} />
            </View>
        </View>
    );
};

const Footer = () => (
    <CardItem>
        <View style={[preset.flexDirectionRow, preset.marginBottomSmall]}>
            <SendButton />
            <View style={preset.marginTiny} />
            <BringButton />
        </View>
    </CardItem>
);

const SendButton = () => {
    const { t } = useTranslation("home");
    const { push } = useNavigation();
    const onPress = useCallback(() => {
        Sentry.track(Sentry.trackingTopics.WITHDRAW);
    }, []);
    return (
        <Button primary={true} bordered={true} rounded={true} block={true} onPress={onPress} style={preset.flex1}>
            <Text>{t("send")}</Text>
        </Button>
    );
};

const BringButton = () => {
    const { t } = useTranslation("home");
    const { push } = useNavigation();
    const onPress = useCallback(() => {
        Sentry.track(Sentry.trackingTopics.DEPOSIT);
    }, []);
    return (
        <Button primary={true} rounded={true} block={true} onPress={onPress} style={preset.flex1}>
            <Text>{t("bring")}</Text>
        </Button>
    );
};

const useWalletEffects = () => {
    const { updating, update } = useAssetBalancesUpdater();
    const { assets } = useContext(AssetContext);
    const { getPendingWithdrawalTransactions } = useContext(PendingTransactionsContext);
    const { handlePendingWithdrawal } = usePendingWithdrawalHandler();
    const { isFocused } = useFocusState();
    const { attemptToRecover } = useDepositionRecovery();
    const count = assets.reduce(
        (sum, asset) => sum + (getPendingWithdrawalTransactions(asset.ethereumAddress) || []).length,
        0
    );
    useEffect(() => {
        update();
        attemptToRecover();
    }, []);
    useAsyncEffect(async () => {
        if (isFocused && count && Number(count) > 0) {
            await handlePendingWithdrawal();
        }
    }, [count, isFocused]);
    return { updating, update };
};

export default WalletCard;
