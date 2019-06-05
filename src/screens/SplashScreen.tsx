import React, { useContext, useEffect } from "react";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Asset, Font, SecureStore, SplashScreen as ExpoSplashScreen } from "expo";
import { LocalAddress } from "loom-js/dist";
import { AddressMapper } from "loom-js/dist/contracts";
import { SavingsContext } from "../contexts/SavingsContext";
import { TokensContext } from "../contexts/TokensContext";
import { WalletContext } from "../contexts/WalletContext";
import EthereumWallet from "../evm/EthereumWallet";
import LoomWallet from "../evm/LoomWallet";

const SplashScreen = () => {
    const { setMnemonic, setLoomWallet, setEthereumWallet } = useContext(WalletContext);
    const { setTokens } = useContext(TokensContext);
    const { setDecimals, setAsset } = useContext(SavingsContext);
    const { navigate } = useNavigation();
    useEffect(() => {
        ExpoSplashScreen.preventAutoHide();
        const init = async () => {
            try {
                await loadFonts();
                await loadResources();
                const mnemonic = await SecureStore.getItemAsync("mnemonic");
                if (mnemonic) {
                    const loomWallet = new LoomWallet(mnemonic);
                    const ethereumWallet = new EthereumWallet(mnemonic);
                    const market = await loomWallet.MoneyMarket.deployed();
                    await addIdentityMapping(ethereumWallet, loomWallet);
                    const tokens = await loomWallet.fetchERC20Tokens();
                    const assetAddress = await market.asset();
                    const asset = tokens.find(token =>
                        token.loomAddress.local.equals(LocalAddress.fromHexString(assetAddress))
                    );
                    const decimals = Number((await market.DECIMALS()).toString());
                    setMnemonic(mnemonic);
                    setLoomWallet(loomWallet);
                    setEthereumWallet(ethereumWallet);
                    setTokens(tokens);
                    setAsset(asset);
                    setDecimals(decimals);

                    navigate("Main");
                } else {
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
        Roboto: require("native-base/Fonts/Roboto.ttf"),
        Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
        SimpleLineIcons: require("@expo/vector-icons/fonts/SimpleLineIcons.ttf"),
        MaterialIcons: require("@expo/vector-icons/fonts/MaterialIcons.ttf"),
        AntDesign: require("@expo/vector-icons/fonts/AntDesign.ttf")
    });
};

const loadResources = (): Promise<void[]> => {
    const images = [
        require("../assets/main-bg.png"),
        require("../assets/icon-light.png"),
        require("../assets/logo-light.png")
    ];
    return Promise.all(
        images.map(image => {
            return Asset.fromModule(image).downloadAsync();
        })
    );
};

const addIdentityMapping = async (ethereumWallet: EthereumWallet, loomWallet: LoomWallet) => {
    const addressMapper = await AddressMapper.createAsync(loomWallet.client, loomWallet.address);
    if (!(await addressMapper.hasMappingAsync(ethereumWallet.address))) {
        await addressMapper.addIdentityMappingAsync(loomWallet.address, ethereumWallet.address, ethereumWallet);
    }
};

export default SplashScreen;
