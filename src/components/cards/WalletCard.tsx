import React, { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, Text as NativeText, View } from "react-native";
import { useFocusState, useNavigation } from "react-navigation-hooks";
import { defaultKeyExtractor } from "../../utils/react-native-utils";

import { Address } from "@alice-finance/alice.js/dist";
import { ZERO_ADDRESS } from "@alice-finance/alice.js/dist/constants";
import { Button, Card, CardItem, Icon, Text } from "native-base";
import { AssetContext } from "../../contexts/AssetContext";
import { BalancesContext } from "../../contexts/BalancesContext";
import { ChainContext } from "../../contexts/ChainContext";
import { PendingTransactionsContext } from "../../contexts/PendingTransactionsContext";
import useAssetBalancesUpdater from "../../hooks/useAssetBalancesUpdater";
import useAsyncEffect from "../../hooks/useAsyncEffect";
import useDepositionRecovery from "../../hooks/useDepositionRecovery";
import usePendingWithdrawalHandler from "../../hooks/usePendingWithdrawalHandler";
import preset from "../../styles/preset";
import { formatValue } from "../../utils/big-number-utils";
import Sentry from "../../utils/Sentry";
import AssetListItem from "../AssetListItem";
import RefreshButton from "../buttons/RefreshButton";
import HeadlineText from "../texts/HeadlineText";

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
                <FeeBalanceView />
                <Footer />
            </Card>
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

const FeeBalanceView = () => {
    const { t } = useTranslation("home");
    const { getBalance } = useContext(BalancesContext);
    const myEthBalance = getBalance(Address.createEthereumAddress(ZERO_ADDRESS));
    const onPressMore = useCallback(() => {
        Alert.alert(t("wallet.myFeeBalance"), t("wallet.myFeeBalance.description"));
    }, []);
    return (
        <View style={[preset.flexDirectionRow]}>
            <View style={preset.flex1} />
            <Button
                rounded={true}
                transparent={true}
                small={true}
                onPress={onPressMore}
                style={[preset.marginRightNormal, preset.marginBottomSmall]}>
                <NativeText style={[preset.fontSize16, preset.colorGrey, preset.textAlignRight]}>
                    {t("wallet.myFeeBalance") + " : " + formatValue(myEthBalance, 18) + " ETH"}
                </NativeText>
                <Icon type={"AntDesign"} name={"questioncircleo"} style={preset.fontSize14} />
            </Button>
        </View>
    );
};

const Footer = () => {
    const { isReadOnly } = useContext(ChainContext);
    return (
        <CardItem>
            {isReadOnly ? (
                <CreateWalletButton />
            ) : (
                <View style={[preset.flexDirectionRow, preset.marginBottomSmall]}>
                    <SendButton />
                    <View style={preset.marginTiny} />
                    <ReceiveButton />
                </View>
            )}
        </CardItem>
    );
};

const CreateWalletButton = () => {
    const { t } = useTranslation("profile");
    const { push } = useNavigation();
    const onPress = useCallback(() => {
        Sentry.track(Sentry.trackingTopics.START);
        push("Start");
    }, []);
    return (
        <Button primary={true} bordered={true} rounded={true} block={true} onPress={onPress} style={preset.flex1}>
            <Text>{t("createWallet")}</Text>
        </Button>
    );
};

const SendButton = () => {
    const { t } = useTranslation("home");
    const onPress = useCallback(() => {
        Sentry.track(Sentry.trackingTopics.SEND);
        Alert.alert(t("send"), t("send.warning"));
    }, []);
    return (
        <Button primary={true} bordered={true} rounded={true} block={true} onPress={onPress} style={preset.flex1}>
            <Text>{t("send")}</Text>
        </Button>
    );
};

const ReceiveButton = () => {
    const { t } = useTranslation("home");
    const { push } = useNavigation();
    const onPress = useCallback(() => {
        Sentry.track(Sentry.trackingTopics.RECEIVE);
        push("ReceiveStep1");
    }, []);
    return (
        <Button primary={true} rounded={true} block={true} onPress={onPress} style={preset.flex1}>
            <Text>{t("receive")}</Text>
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
