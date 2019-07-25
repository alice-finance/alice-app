import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";

import { ERC20Asset } from "@alice-finance/alice.js";
import { Body, Icon, Left, ListItem, Text, View } from "native-base";
import platform from "../../native-base-theme/variables/platform";
import { AssetContext } from "../contexts/AssetContext";
import preset from "../styles/preset";
import { openTx } from "../utils/ether-scan-utils";
import BigNumberText from "./BigNumberText";

export const TypeBadge = ({ color, inProgress, withdraw }) => {
    return (
        <View
            style={{
                borderColor: color,
                borderWidth: platform.borderWidth * 2,
                width: 48,
                height: 48,
                borderRadius: 24,
                paddingTop: 14
            }}>
            <Icon
                type="AntDesign"
                name={inProgress ? "hourglass" : withdraw ? "arrowleft" : "arrowright"}
                style={[preset.fontSize20, preset.alignCenter, { color }]}
            />
        </View>
    );
};

const TransactionLogListItem = ({
    asset,
    item,
    blockNumber
}: {
    asset: ERC20Asset;
    item: any;
    blockNumber: number | null;
}) => {
    const { t } = useTranslation("asset");
    const { getAssetByEthereumAddress } = useContext(AssetContext);
    const withdraw = !!item.value;
    const swap = !!item.actualDestAmount;
    const blockConfirmNumber = __DEV__ ? 15 : 10;
    const inProgress =
        !swap && blockNumber && item.log.blockNumber && blockNumber - item.log.blockNumber <= blockConfirmNumber;
    const color = inProgress ? platform.brandWarning : withdraw ? platform.brandDanger : platform.brandInfo;
    const symbol = swap && getAssetByEthereumAddress(item.dest) ? getAssetByEthereumAddress(item.dest)!.symbol : "";
    return (
        <ListItem
            noBorder={true}
            onPress={useCallback(() => openTx(item.log.transactionHash), [item.log.transactionHash])}>
            <Left style={[preset.flex0]}>
                <TypeBadge inProgress={inProgress} color={color} withdraw={withdraw} />
            </Left>
            <Body style={[preset.flex1, preset.marginLeftSmall]}>
                <Text note={true} style={[preset.padding0, preset.marginLeftSmall]}>
                    {withdraw ? t("withdrawal") : swap ? t("tokenConversion") : t("deposit")}{" "}
                    {inProgress &&
                        " (" +
                            t("processing") +
                            (blockNumber ? " " + (blockNumber - item.log.blockNumber) : " -") +
                            "/" +
                            blockConfirmNumber +
                            ")"}
                </Text>
                {!swap ? (
                    <BigNumberText
                        value={item.amount || item.value}
                        style={[preset.marginLeftSmall, preset.fontSize20]}
                        suffix={" " + asset.symbol}
                    />
                ) : (
                    <View style={{ flexDirection: "row" }}>
                        <BigNumberText
                            value={item.actualSrcAmount}
                            style={[preset.marginLeftSmall, preset.fontSize20]}
                            suffix={" " + asset.symbol}
                        />
                        <Icon
                            type="AntDesign"
                            name="arrowright"
                            style={[preset.fontSize20, preset.alignCenter, preset.marginLeftSmall]}
                        />
                        <BigNumberText
                            value={item.actualDestAmount}
                            style={[preset.marginLeftSmall, preset.fontSize20]}
                            suffix={" " + symbol}
                        />
                    </View>
                )}
            </Body>
        </ListItem>
    );
};

export default TransactionLogListItem;
