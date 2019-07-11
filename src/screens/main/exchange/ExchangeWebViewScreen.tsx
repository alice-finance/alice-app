import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clipboard, View } from "react-native";
import { Menu } from "react-native-paper";
import ProgressWebView from "react-native-progress-webview";
import { useNavigation } from "react-navigation-hooks";

import { Linking } from "expo";
import { Button, Container, Icon } from "native-base";
import { ChainContext } from "../../../contexts/ChainContext";
import preset from "../../../styles/preset";
import SnackBar from "../../../utils/SnackBar";
import { Exchange } from "./ExchangeScreen";

const ExchangeWebViewScreen = () => {
    const { getParam, setParams } = useNavigation();
    const webView = useRef<ProgressWebView>(null);
    const exchange: Exchange = getParam("exchange");
    useEffect(() => {
        setParams({ uri: exchange.url, webView });
    }, [webView]);
    return (
        <Container style={preset.flex1}>
            <ProgressWebView ref={webView} source={{ uri: exchange.url }} style={preset.flex1} />
        </Container>
    );
};

ExchangeWebViewScreen.navigationOptions = ({ navigation }) => ({
    headerRight: <HeaderMenu uri={navigation.getParam("uri")} webView={navigation.getParam("webView")} />
});

const HeaderMenu = ({ uri, webView }) => {
    const { t } = useTranslation(["exchange", "profile"]);
    const { ethereumChain } = useContext(ChainContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const openMenu = () => setMenuOpen(true);
    const closeMenu = () => setMenuOpen(false);
    const goBack = useCallback(() => webView.current.goBack(), [webView]);
    const goForward = useCallback(() => webView.current.goForward(), [webView]);
    const refresh = useCallback(() => webView.current.reload(), [webView]);
    const copy = useCallback(() => {
        Clipboard.setString(ethereumChain!.getAddress().toLocalAddressString());
        SnackBar.success(t("profile:addressCopiedToTheClipboard"));
    }, []);
    const openInBrowser = useCallback(() => {
        Linking.openURL(uri);
        closeMenu();
    }, [uri]);
    return (
        <View style={preset.flexDirectionRow}>
            <IconButton iconName={"keyboard-arrow-left"} onPress={goBack} />
            <IconButton iconName={"keyboard-arrow-right"} onPress={goForward} />
            <IconButton iconName={"refresh"} onPress={refresh} />
            <IconButton simple={true} iconName={"key"} onPress={copy} />
            <Menu
                visible={menuOpen}
                onDismiss={closeMenu}
                anchor={<IconButton iconName={"more-vert"} onPress={openMenu} />}>
                <Menu.Item onPress={openInBrowser} title={t("openInBrowser")} />
            </Menu>
        </View>
    );
};

const IconButton = ({ simple = false, iconName, onPress, style = {} }) => (
    <Button transparent={true} rounded={true} onPress={onPress} style={style} icon={true}>
        <Icon
            type={simple ? "SimpleLineIcons" : "MaterialIcons"}
            name={iconName}
            style={[preset.marginTopTiny, { marginLeft: 12, marginRight: 12 }]}
        />
    </Button>
);

export default ExchangeWebViewScreen;
