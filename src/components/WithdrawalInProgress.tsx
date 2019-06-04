import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button, Text } from "native-base";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import ERC20Token from "../evm/ERC20Token";
import preset from "../styles/preset";
import { openTx } from "../utils/ether-scan-utils";
import Spinner from "./Spinner";

const WithdrawalInProgress = ({ token }: { token: ERC20Token }) => {
    const { t } = useTranslation("asset");
    const { getPendingWithdrawalTransactions } = useContext(PendingTransactionsContext);
    const pendingWithdrawalTransactions = getPendingWithdrawalTransactions(token.loomAddress.toLocalAddressString());
    const onPress = useCallback(
        () => openTx(pendingWithdrawalTransactions[pendingWithdrawalTransactions.length - 1].hash),
        [pendingWithdrawalTransactions]
    );
    return pendingWithdrawalTransactions.length > 0 ? (
        <View>
            <Spinner compact={true} label={t("withdrawing") + ` (${pendingWithdrawalTransactions.length}/3)`} />
            <Text style={[preset.colorDanger, preset.marginLarge]}>{t("withdrawal.description")}</Text>
            {pendingWithdrawalTransactions.length >= 3 && (
                <Button bordered={true} onPress={onPress} style={preset.alignCenter}>
                    <Text numberOfLines={1} ellipsizeMode="middle">
                        {t("viewTransaction")}
                    </Text>
                </Button>
            )}
        </View>
    ) : (
        <View />
    );
};

export default WithdrawalInProgress;
