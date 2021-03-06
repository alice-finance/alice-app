import React, { useContext } from "react";
import { NetInfo } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import Alice from "@alice-finance/alice.js/dist";
import EthereumChain from "@alice-finance/alice.js/dist/chains/EthereumChain";
import LoomChain from "@alice-finance/alice.js/dist/chains/LoomChain";
import { AppLoading, SplashScreen as ExpoSplashScreen } from "expo";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import * as SecureStore from "expo-secure-store";
import { LocalAddress } from "loom-js/dist";
import { EMPTY_MNEMONIC } from "../constants/bip39";
import { AssetContext } from "../contexts/AssetContext";
import { ChainContext } from "../contexts/ChainContext";
import { SavingsContext } from "../contexts/SavingsContext";
import useUpdateChecker from "../hooks/useUpdateChecker";
import { getGasPrice } from "../utils/ether-gas-utils";
import { mapAccounts } from "../utils/loom-utils";
import Sentry from "../utils/Sentry";

const SplashScreen = () => {
    const { navigate } = useNavigation();
    const { load } = useLoader();
    const onFinish = () => {
        navigate("Main");
        ExpoSplashScreen.hide();
    };
    const onError = () => navigate("NotConnected");
    return <AppLoading startAsync={load} onFinish={onFinish} onError={onError} />;
};

const useLoader = () => {
    const { setMnemonic, setEthereumChain, setLoomChain } = useContext(ChainContext);
    const { setAssets } = useContext(AssetContext);
    const { setDecimals, setAsset } = useContext(SavingsContext);
    const { checkForUpdate } = useUpdateChecker();
    const load = async () => {
        ExpoSplashScreen.preventAutoHide();
        await loadFonts();
        await loadResources();
        await throwIfNotConnected();
        const { mnemonic, loomChain, ethereumChain } = await loadChainContext();
        setMnemonic(mnemonic);
        setLoomChain(loomChain);
        setEthereumChain(ethereumChain);
        // Patch getGasPrice function
        ethereumChain.getProvider().getGasPrice = getGasPrice;

        const assets = await loomChain.getERC20AssetsAsync();
        const { asset, decimals } = await loadSavingsContext(loomChain, assets);
        setAsset(asset!);
        setDecimals(decimals);
        setAssets(assets);
        checkForUpdate();
        trackAppStart(ethereumChain, loomChain);
    };
    return { load };
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
        require("../assets/not-connected.jpg"),
        require("../assets/icon.png"),
        require("../assets/rabbit.jpg")
    ];
    return Promise.all(
        images.map(image => {
            return Asset.fromModule(image).downloadAsync();
        })
    );
};

const throwIfNotConnected = async () => {
    if (!(await NetInfo.isConnected.fetch())) {
        throw new Error("Connectivity Error");
    }
};

const trackAppStart = (ethereumChain, loomChain) => {
    Sentry.setTrackingInfo(
        ethereumChain.getAddress().toLocalAddressString(),
        loomChain.getAddress().toLocalAddressString()
    );
    Sentry.track(Sentry.trackingTopics.APP_START);
};

const loadChainContext = async () => {
    const mnemonic = await SecureStore.getItemAsync("mnemonic");
    const ethereumPrivateKey = await SecureStore.getItemAsync("ethereumPrivateKey");
    const loomPrivateKey = await SecureStore.getItemAsync("loomPrivateKey");
    if (mnemonic && ethereumPrivateKey && loomPrivateKey) {
        const ethereumChain = new EthereumChain(ethereumPrivateKey, __DEV__);
        const loomChain = new LoomChain(loomPrivateKey, __DEV__);
        await mapAccounts(ethereumChain, loomChain);
        return { mnemonic, ethereumChain, loomChain };
    } else {
        const alice = Alice.fromMnemonic(EMPTY_MNEMONIC, __DEV__);
        return { mnemonic: EMPTY_MNEMONIC, ethereumChain: alice.getEthereumChain(), loomChain: alice.getLoomChain() };
    }
};

const loadSavingsContext = async (loomChain, assets) => {
    const market = loomChain.getMoneyMarket();
    const assetAddress = await market.asset();
    const asset = assets.find(token => token.loomAddress.local.equals(LocalAddress.fromHexString(assetAddress)));
    const decimals = Number((await market.DECIMALS()).toString());
    return { asset, decimals };
};

export default SplashScreen;
