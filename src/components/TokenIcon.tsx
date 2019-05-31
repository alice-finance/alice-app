import React, { useCallback, useState } from "react";
import { Image, StyleSheet, View, ViewProps } from "react-native";

import { NULL_ADDRESS } from "../constants/token";

interface TokenIconProps extends ViewProps {
    address: string;
    width: number;
    height: number;
}

const TokenIcon: React.FunctionComponent<TokenIconProps> = ({ address, width, height, style }) => {
    address = address && address.toString().toLowerCase();
    const [loaded, setLoaded] = useState(false);
    const onLoad = useCallback(() => setLoaded(true), [loaded]);
    const uri =
        address === NULL_ADDRESS
            ? "https://raw.githubusercontent.com/ethereum/ethereum-org/master/public/images/logos/ETHEREUM-ICON_Black.png"
            : `https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/${address}.png`;
    return (
        <View style={[{ width, height }, style]}>
            {(!address || !loaded) && <View style={styles(width, height).placeholder} />}
            <Image
                source={{ uri }}
                onLoad={onLoad}
                style={{ width: "100%", height: "100%", borderRadius: height / 2 }}
            />
        </View>
    );
};

const styles = (width, height) =>
    StyleSheet.create({
        placeholder: {
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "#f5f4f5",
            borderColor: "#f5f4f5",
            borderWidth: 1,
            borderRadius: height / 4
        }
    });

export default TokenIcon;
