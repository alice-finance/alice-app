import React, { useContext } from "react";
import { View } from "react-native";

import { Card, CardItem, Left } from "native-base";
import { PendingTransactionsContext } from "../../contexts/PendingTransactionsContext";
import preset from "../../styles/preset";
import ERC20ReceiveSteps from "../steps/ERC20ReceiveSteps";
import ETHReceiveSteps from "../steps/ETHReceiveSteps";
import BigNumberText from "../texts/BigNumberText";
import TokenIcon from "../TokenIcon";

const PendingAmountCard = ({ asset, amount }) => {
    const address = asset.ethereumAddress.toLocalAddressString();
    const { getPendingDepositTransactions, getLastPendingDepositTransaction } = useContext(PendingTransactionsContext);
    const pendingTransactions = getPendingDepositTransactions(asset.ethereumAddress);
    const lastTransaction = getLastPendingDepositTransaction(asset.ethereumAddress);
    const currentStep =
        pendingTransactions.length === 0
            ? 2
            : pendingTransactions.length + (lastTransaction && lastTransaction.blockHash ? 2 : 1);
    return (
        <View style={[preset.marginLeftNormal, preset.marginRightNormal, preset.marginBottomSmall]}>
            <Card>
                <CardItem style={[preset.marginTopSmall, preset.marginBottomSmall]}>
                    <Left>
                        <TokenIcon address={address} width={28} height={28} />
                        <BigNumberText value={amount} suffix={" " + asset.symbol} style={preset.marginLeftSmall} />
                    </Left>
                </CardItem>
                {asset.ethereumAddress.isZero() ? (
                    <ETHReceiveSteps asset={asset} amount={amount} currentStep={currentStep} />
                ) : (
                    <ERC20ReceiveSteps asset={asset} amount={amount} currentStep={currentStep} />
                )}
            </Card>
        </View>
    );
};

export default PendingAmountCard;
