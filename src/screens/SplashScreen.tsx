import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Font, SplashScreen as ExpoSplashScreen } from "expo";
import useMnemonic from "../hooks/useMnemonic";

const SplashScreen = () => {
    const [fontLoaded, setFontLoaded] = useState(false);
    const { mnemonicLoaded, mnemonic } = useMnemonic();
    const { navigate } = useNavigation();
    useEffect(() => {
        ExpoSplashScreen.preventAutoHide();
        Font.loadAsync({
            Roboto: require("native-base/Fonts/Roboto.ttf"),
            Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
        }).finally(() => setFontLoaded(true));
    }, []);
    useEffect(() => {
        if (fontLoaded && mnemonicLoaded) {
            if (mnemonic) {
                // TODO: mnemonic
                navigate("Main");
            } else {
                // TODO: no mnemonic
                navigate("Start");
            }
            ExpoSplashScreen.hide();
        }
    }, [fontLoaded]);
    return <View />;
};

export default SplashScreen;
