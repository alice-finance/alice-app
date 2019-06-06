import React, { useContext, useEffect } from "react";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Asset, Font, SecureStore, SplashScreen as ExpoSplashScreen } from "expo";
import { EthersSigner, LocalAddress } from "loom-js/dist";
import { AddressMapper } from "loom-js/dist/contracts";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { SavingsContext } from "../contexts/SavingsContext";
import { TokensContext } from "../contexts/TokensContext";
import EthereumConnector from "../evm/EthereumConnector";
import LoomConnector from "../evm/LoomConnector";

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
                await loadResources();
                const mnemonic = await SecureStore.getItemAsync("mnemonic");
                if (mnemonic) {
                    const ethereumConnector = new EthereumConnector(mnemonic);
                    const loomConnector = new LoomConnector(mnemonic);
                    await addIdentityMapping(ethereumConnector, loomConnector);

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

const addIdentityMapping = async (ethereumConnector: EthereumConnector, loomConnector: LoomConnector) => {
    const addressMapper = await AddressMapper.createAsync(LoomConnector.CLIENT, loomConnector.address);
    try {
        const signer = new EthersSigner(ethereumConnector.wallet);
        await addressMapper.addIdentityMappingAsync(loomConnector.address, ethereumConnector.address, signer);
    } catch (e) {}
};

export default SplashScreen;
