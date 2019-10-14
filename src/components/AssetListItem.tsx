import React, { FunctionComponent, useCallback, useContext } from "react";
import { View } from "react-native";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { Icon, ListItem, Text } from "native-base";
import { BalancesContext } from "../contexts/BalancesContext";
import preset from "../styles/preset";
import { formatValue } from "../utils/big-number-utils";
import TokenIcon from "./TokenIcon";

interface AssetListItemProps {
    asset: ERC20Asset;
    noBorder?: boolean;
    onPress?: (item: ERC20Asset) => void;
}

const AssetListItem: FunctionComponent<AssetListItemProps> = ({ asset, onPress }) => {
    const { getBalance } = useContext(BalancesContext);
    const balance = getBalance(asset.loomAddress);
    const button = !!onPress;
    const onPressAsset = useCallback(() => {
        if (onPress) {
            onPress(asset);
        }
    }, []);
    return (
        <ListItem noBorder={!button} button={button} iconRight={button} onPress={onPressAsset}>
            <View style={[preset.flexDirectionRow, preset.alignItemsCenter]}>
                <TokenIcon address={asset.ethereumAddress.toLocalAddressString()} width={24} height={24} />
                <Text style={[preset.flex1, preset.marginLeftNormal, preset.fontSize20, preset.colorGrey]}>
                    {asset.name}
                </Text>
                {button ? (
                    <Icon type={"MaterialIcons"} name={"chevron-right"} />
                ) : (
                    <>
                        <Text style={[preset.fontSize20, preset.fontWeightBold, preset.textAlignRight]}>
                            {formatValue(balance, asset.decimals)}
                        </Text>
                        <Text style={[preset.fontSize20, preset.marginLeftSmall, { width: 56 }]}>{asset.symbol}</Text>
                    </>
                )}
            </View>
        </ListItem>
    );
};

export default AssetListItem;
