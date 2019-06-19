import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Text } from "native-base";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import ERC20Token from "../evm/ERC20Token";
import preset from "../styles/preset";
import Spinner from "./Spinner";

const WithdrawalInProgress = ({ token }: { token: ERC20Token }) => {
    const { t } = useTranslation("asset");
    const { getPendingWithdrawalTransactions } = useContext(PendingTransactionsContext);
    const pendingWithdrawalTransactions = getPendingWithdrawalTransactions(token.loomAddress);
    return (
        <View>
            <Spinner compact={true} label={t("withdrawing")} />
            <Text style={[preset.marginLarge]}>{t("withdrawal.description")}</Text>
        </View>
    );
};

export default WithdrawalInProgress;
