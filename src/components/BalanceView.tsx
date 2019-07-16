import React from "react";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { ethers } from "ethers";
import { Text, View } from "native-base";
import preset from "../styles/preset";
import { formatValue } from "../utils/big-number-utils";

const BalanceView = ({
    asset,
    balance,
    style
}: {
    asset: ERC20Asset;
    balance: ethers.utils.BigNumber;
    style?: object;
}) => (
    <View style={[style, preset.flexDirectionRow, preset.alignItemsCenter]}>
        <Text style={[preset.fontSize32]}>{formatValue(balance, asset.decimals, 2)}</Text>
        <Text style={[preset.fontSize24, preset.marginLeftSmall]}>{asset.symbol}</Text>
    </View>
);

export default BalanceView;
