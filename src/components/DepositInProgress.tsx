import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button, Text } from "native-base";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import ERC20Token from "../evm/ERC20Token";
import preset from "../styles/preset";
import { openTx } from "../utils/ether-scan-utils";
import Spinner from "./Spinner";

const DepositInProgress = ({ asset }: { asset: ERC20Token }) => {
    const { t } = useTranslation("asset");
    const { getPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const pendingDepositTransactions = getPendingDepositTransactions(asset.ethereumAddress);
    const onPress = useCallback(() => openTx(pendingDepositTransactions[pendingDepositTransactions.length - 1].hash!), [
        pendingDepositTransactions
    ]);
    return (
        <View>
            <Spinner compact={true} label={t("transferring")} />
            <Text style={[preset.marginLarge]}>{t("deposit.warning")}</Text>
            {pendingDepositTransactions.length > 0 && (
                <Button bordered={true} onPress={onPress} style={preset.alignCenter}>
                    <Text numberOfLines={1} ellipsizeMode="middle">
                        {t("viewTransaction")}
                    </Text>
                </Button>
            )}
        </View>
    );
};

export default DepositInProgress;
