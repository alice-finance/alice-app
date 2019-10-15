import React, { useCallback, useState } from "react";
import { Image, StyleSheet, View, ViewProps } from "react-native";
import Identicon from "identicon.js";

interface ProfileIconProps extends ViewProps {
    address: string;
    width: number;
    height: number;
}

const ProfileIcon: React.FunctionComponent<ProfileIconProps> = ({ address, width, height, style }) => {
    address = address && address.toString().toLowerCase();
    const [loaded, setLoaded] = useState(false);
    const onLoad = useCallback(() => setLoaded(true), [loaded]);
    const options = {
        size: 120,
        background: [255, 255, 255, 255],
        saturation: 0.6,
        brightness: 0.75
    };
    const data = new Identicon(address, options).toString();
    const uri = `data:image/png;base64,${data}`;
    return (
        <View style={[{ width, height }, style]}>
            {(!address || !loaded) && <View style={styles().placeholder} />}
            <Image
                source={{ uri }}
                onLoad={onLoad}
                style={{ width: "100%", height: "100%", borderColor: "#f5f4f5", borderWidth: 1 }}
            />
        </View>
    );
};

const styles = () =>
    StyleSheet.create({
        placeholder: {
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "#f5f4f5",
            borderColor: "#f5f4f5",
            borderWidth: 1
        }
    });

export default ProfileIcon;
