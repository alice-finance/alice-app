import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Container } from "native-base";
import CaptionText from "../../../components/CaptionText";
import DepositInProgress from "../../../components/DepositInProgress";
import DepositSlider from "../../../components/DepositSlider";
import HeadlineText from "../../../components/HeadlineText";
import SubtitleText from "../../../components/SubtitleText";
import TokenIcon from "../../../components/TokenIcon";
import WithdrawalInProgress from "../../../components/WithdrawalInProgress";
import { Spacing } from "../../../constants/dimension";
import { BalancesContext } from "../../../contexts/BalancesContext";
import { PendingTransactionsContext } from "../../../contexts/PendingTransactionsContext";
import ERC20Token from "../../../evm/ERC20Token";
import preset from "../../../styles/preset";
import { formatValue } from "../../../utils/bn-utils";

const ManageAssetScreen = () => {
    const { t } = useTranslation("asset");
    const { getParam } = useNavigation();
    const token: ERC20Token = getParam("token");
    const { getPendingDepositTransactions, getPendingWithdrawalTransactions } = useContext(PendingTransactionsContext);
    const pendingDepositTransactions = getPendingDepositTransactions(token.loomAddress.toLocalAddressString());
    const pendingWithdrawalTransactions = getPendingWithdrawalTransactions(token.loomAddress.toLocalAddressString());
    const inProgress = pendingDepositTransactions.length > 0 || pendingWithdrawalTransactions.length > 0;
    if (token) {
        return (
            <Container>
                <TokenView token={token} />
                <HeadlineText aboveText={true}>{t("depositAmount")}</HeadlineText>
                <CaptionText small={true}>{t("depositAmount.description")}</CaptionText>
                <View style={preset.marginNormal}>
                    {inProgress ? (
                        <View style={[preset.marginBottomLarge, preset.paddingNormal]}>
                            <DepositInProgress token={token} />
                            <WithdrawalInProgress token={token} />
                        </View>
                    ) : (
                        <DepositSlider token={token} />
                    )}
                </View>
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

export default ManageAssetScreen;
