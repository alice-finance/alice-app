import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { Text } from "native-base";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import preset from "../styles/preset";
import Spinner from "./Spinner";

const WithdrawalInProgress = ({ asset }: { asset: ERC20Asset }) => {
    const { t } = useTranslation("asset");
    const { getPendingWithdrawalTransactions } = useContext(PendingTransactionsContext);
    const pendingWithdrawalTransactions = getPendingWithdrawalTransactions(asset.ethereumAddress);
    return (
        <View>
            <Spinner compact={true} label={t("transferring")} />
            <Text style={[preset.marginLarge]}>{t("withdrawal.warning")}</Text>
        </View>
    );
};

export default WithdrawalInProgress;
