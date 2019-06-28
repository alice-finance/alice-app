import React, { useContext } from "react";
import { useNavigation } from "react-navigation-hooks";

import EthereumChain from "@alice-finance/alice.js/dist/chains/EthereumChain";
import LoomChain from "@alice-finance/alice.js/dist/chains/LoomChain";
import { AppLoading, SplashScreen as ExpoSplashScreen } from "expo";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import * as SecureStore from "expo-secure-store";
import { LocalAddress } from "loom-js/dist";
import { AssetContext } from "../contexts/AssetContext";
import { ChainContext } from "../contexts/ChainContext";
import { SavingsContext } from "../contexts/SavingsContext";
import * as Analytics from "../helpers/Analytics";
import useTokenBalanceUpdater from "../hooks/useTokenBalanceUpdater";

const SplashScreen = () => {
    const { load, onError, onFinish } = useLoader();
    return <AppLoading startAsync={load} onFinish={onFinish} onError={onError} />;
};

const useLoader = () => {
    const { setMnemonic, setEthereumChain, setLoomChain } = useContext(ChainContext);
    const { setAssets } = useContext(AssetContext);
    const { setDecimals, setAsset } = useContext(SavingsContext);
    const { navigate } = useNavigation();
    const { update } = useTokenBalanceUpdater();
    const load = async () => {
        Analytics.track(Analytics.events.APP_START);
        ExpoSplashScreen.preventAutoHide();
        await loadFonts();
        const mnemonic = await SecureStore.getItemAsync("mnemonic");
        const ethereumPrivateKey = await SecureStore.getItemAsync("ethereumPrivateKey");
        const loomPrivateKey = await SecureStore.getItemAsync("loomPrivateKey");
        if (mnemonic && ethereumPrivateKey && loomPrivateKey) {
            const ethereumChain = new EthereumChain(ethereumPrivateKey, __DEV__);
            const loomChain = new LoomChain(loomPrivateKey, __DEV__);

            const assets = await loomChain.getERC20AssetsAsync();
            const market = loomChain.getMoneyMarket();
            const assetAddress = await market.asset();
            const asset = assets.find(token =>
                token.loomAddress.local.equals(LocalAddress.fromHexString(assetAddress))
            );
            const decimals = Number((await market.DECIMALS()).toString());

            setMnemonic(mnemonic);
            setEthereumChain(ethereumChain);
            setLoomChain(loomChain);
            setAssets(assets);
            setAsset(asset);
            setDecimals(decimals);
            await update();

            navigate("Main");
        } else {
            await loadResources();
            navigate("Start");
        }
    };
    const onFinish = () => ExpoSplashScreen.hide();
    const onError = () => navigate("Start");
    return { load, onError, onFinish };
};

const loadFonts = (): Promise<void> => {
    return Font.loadAsync({
        Roboto: require("../assets/Roboto.ttf"),
        Roboto_medium: require("../assets/Roboto_medium.ttf"),
        SimpleLineIcons: require("../assets/SimpleLineIcons.ttf"),
        "simple-line-icons": require("../assets/SimpleLineIcons.ttf"),
        MaterialIcons: require("../assets/MaterialIcons.ttf"),
        "Material Icons": require("../assets/MaterialIcons.ttf"),
        MaterialCommunityIcons: require("../assets/MaterialCommunityIcons.ttf"),
        "Material Design Icons": require("../assets/MaterialCommunityIcons.ttf"),
        AntDesign: require("../assets/AntDesign.ttf"),
        anticon: require("../assets/AntDesign.ttf")
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
