import React, { useContext, useEffect } from "react";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Font, SecureStore, SplashScreen as ExpoSplashScreen } from "expo";
import { AddressMapper } from "loom-js/dist/contracts";
import { TokensContext } from "../contexts/TokensContext";
import { WalletContext } from "../contexts/WalletContext";
import EthereumWallet from "../evm/EthereumWallet";
import LoomWallet from "../evm/LoomWallet";

const SplashScreen = () => {
    const { setMnemonic, setLoomWallet, setEthereumWallet } = useContext(WalletContext);
    const { setTokens } = useContext(TokensContext);
    const { navigate } = useNavigation();
    useEffect(() => {
        ExpoSplashScreen.preventAutoHide();
        const init = async () => {
            try {
                await loadFonts();
                const mnemonic = await SecureStore.getItemAsync("mnemonic");
                if (mnemonic) {
                    const loomWallet = new LoomWallet(mnemonic);
                    const ethereumWallet = new EthereumWallet(mnemonic);
                    await addIdentityMapping(ethereumWallet, loomWallet);
                    setMnemonic(mnemonic);
                    setLoomWallet(loomWallet);
                    setEthereumWallet(ethereumWallet);
                    setTokens(await loomWallet.fetchERC20Tokens());
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
        MaterialIcons: require("@expo/vector-icons/fonts/MaterialIcons.ttf")
    });
};

const addIdentityMapping = async (ethereumWallet: EthereumWallet, loomWallet: LoomWallet) => {
    const addressMapper = await AddressMapper.createAsync(loomWallet.client, loomWallet.address);
    if (!(await addressMapper.hasMappingAsync(ethereumWallet.address))) {
        await addressMapper.addIdentityMappingAsync(loomWallet.address, ethereumWallet.address, ethereumWallet);
    }
};

export default SplashScreen;
