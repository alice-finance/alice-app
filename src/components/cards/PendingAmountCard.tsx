import React, { FunctionComponent, useContext } from "react";
import { View } from "react-native";

import { Address, ERC20Asset } from "@alice-finance/alice.js/dist";
import { BigNumber } from "ethers/utils";
import { Card, CardItem, Left } from "native-base";
import { AssetContext } from "../../contexts/AssetContext";
import { BalancesContext } from "../../contexts/BalancesContext";
import { EthereumContext } from "../../contexts/EthereumContext";
import { PendingTransactionsContext } from "../../contexts/PendingTransactionsContext";
import preset from "../../styles/preset";
import SnackBar from "../../utils/SnackBar";
import ERC20ReceiveSteps from "../steps/ERC20ReceiveSteps";
import ETHReceiveSteps from "../steps/ETHReceiveSteps";
import BigNumberText from "../texts/BigNumberText";
import TokenIcon from "../TokenIcon";

interface PendingAmountCardProps {
    address: Address;
    amount: BigNumber;
}

const PendingAmountCard: FunctionComponent<PendingAmountCardProps> = ({ address, amount }) => {
    const { getAssetByAddress } = useContext(AssetContext);
    const asset = getAssetByAddress(address)!;
    const { currentStep } = useCurretStep(asset);
    return (
        <View style={[preset.marginLeftNormal, preset.marginRightNormal, preset.marginBottomSmall]}>
            <Card>
                <CardItem style={[preset.marginTopSmall, preset.marginBottomSmall]}>
                    <Left>
                        <TokenIcon address={address.toLocalAddressString()} width={28} height={28} />
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

const useCurretStep = (asset: ERC20Asset) => {
    const { getPendingDepositTransactions, getLastPendingDepositTransaction } = useContext(PendingTransactionsContext);
    const { currentBlockNumber } = useContext(EthereumContext);
    const pendingTransactions = getPendingDepositTransactions(asset.ethereumAddress);
    const lastTransaction = getLastPendingDepositTransaction(asset.ethereumAddress);
    let currentStep =
        pendingTransactions.length === 0
            ? 2
            : pendingTransactions.length + (lastTransaction && lastTransaction.blockHash ? 2 : 1);
    if (
        currentStep === 4 &&
        lastTransaction &&
        currentBlockNumber &&
        lastTransaction.blockNumber &&
        lastTransaction.blockNumber + 15 <= currentBlockNumber
    ) {
        currentStep += 1;
    }
    return { currentStep };
};

export default PendingAmountCard;
