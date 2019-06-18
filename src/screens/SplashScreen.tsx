import React, { useContext, useEffect } from "react";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { AntDesign, MaterialCommunityIcons, MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";
import { SplashScreen as ExpoSplashScreen } from "expo";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import * as SecureStore from "expo-secure-store";
import { LocalAddress } from "loom-js/dist";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { SavingsContext } from "../contexts/SavingsContext";
import { TokensContext } from "../contexts/TokensContext";
import EthereumConnector from "../evm/EthereumConnector";
import LoomConnector from "../evm/LoomConnector";
import { mapAccounts } from "../utils/loom-utils";

const SplashScreen = () => {
    const { setMnemonic, setEthereumConnector, setLoomConnector } = useContext(ConnectorContext);
    const { setTokens } = useContext(TokensContext);
    const { setDecimals, setAsset } = useContext(SavingsContext);
    const { navigate } = useNavigation();
    useEffect(() => {
        ExpoSplashScreen.preventAutoHide();
        const init = async () => {
            try {
                await loadFonts();
                const mnemonic = await SecureStore.getItemAsync("mnemonic");
                if (mnemonic) {
                    const ethereumConnector = new EthereumConnector(mnemonic);
                    const loomConnector = new LoomConnector(mnemonic);
                    await mapAccounts(ethereumConnector, loomConnector);

                    const tokens = await loomConnector.fetchERC20Tokens();
                    const market = loomConnector.getMoneyMarket();
                    const assetAddress = await market.asset();
                    const asset = tokens.find(token =>
                        token.loomAddress.local.equals(LocalAddress.fromHexString(assetAddress))
                    );
                    const decimals = Number((await market.DECIMALS()).toString());

                    setMnemonic(mnemonic);
                    setEthereumConnector(ethereumConnector);
                    setLoomConnector(loomConnector);
                    setTokens(tokens);
                    setAsset(asset);
                    setDecimals(decimals);

                    navigate("Main");
                } else {
                    await loadResources();
                    navigate("Start");
                }
                ExpoSplashScreen.hide();
            } catch (e) {
                navigate("Start");
                ExpoSplashScreen.hide();
            }
        };
        init();
    }, []);
    return <View />;
};

const loadFonts = (): Promise<void> => {
    return Font.loadAsync({
        Roboto: require("../assets/Roboto.ttf"),
        Roboto_medium: require("../assets/Roboto_medium.ttf"),
        ...SimpleLineIcons.font,
        ...MaterialIcons.font,
        ...MaterialCommunityIcons.font,
        ...AntDesign.font
    });
};

const loadResources = (): Promise<void[]> => {
    const images = [
        require("../assets/main-bg.png"),
        require("../assets/icon-light.png"),
        require("../assets/logo-light.png"),
        require("../assets/rabbit.jpg")
    ];
    return Promise.all(
        images.map(image => {
            return Asset.fromModule(image).downloadAsync();
        })
    );
};

export default SplashScreen;
