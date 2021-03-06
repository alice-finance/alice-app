/* tslint:disable:ordered-imports */
import "node-libs-react-native/globals";
import "./globals";
import "ethers/dist/shims.js";
import React from "react";
import { Root, StyleProvider, View } from "native-base";
import { I18nextProvider } from "react-i18next";
import firebase from "firebase";
import FlashMessage from "react-native-flash-message";
import getTheme from "./native-base-theme/components";
import platform from "./native-base-theme/variables/platform";
import AppContainer from "./src/AppContainer";
import { ContextProvider } from "./src/contexts";
import i18n from "./src/i18n";
import { Portal } from "react-native-paper";
import { ethers } from "ethers";
import { YellowBox, Platform, StatusBar } from "react-native";
import { useScreens } from "react-native-screens";
import preset from "./src/styles/preset";
import Sentry from "./src/utils/Sentry";

if (__DEV__) {
    YellowBox.ignoreWarnings(["Setting a timer"]);
}
ethers.errors.setLogLevel("error");

if (!__DEV__) {
    Sentry.initialize();
}
useScreens();

const firebaseConfig = {
    apiKey: "AIzaSyCoc1lH9HJK4mBqWXmkehQEn3nCz-A2f9Y",
    authDomain: "alice-finance-indexer.firebaseapp.com",
    databaseURL: "https://alice-finance-indexer.firebaseio.com",
    projectId: "alice-finance-indexer",
    storageBucket: "alice-finance-indexer.appspot.com",
    messagingSenderId: "921241799721",
    appId: "1:921241799721:web:b98e90b6e2cf28b7"
};
firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {
    public render() {
        return (
            <I18nextProvider i18n={i18n}>
                <ContextProvider>
                    <StyleProvider style={getTheme(platform)}>
                        <Root>
                            {Platform.OS === "ios" && <StatusBar barStyle="dark-content" />}
                            <Portal.Host>
                                <View style={preset.flex1}>
                                    <AppContainer screenProps={{ t: i18n.t }} />
                                    <FlashMessage position="top" />
                                </View>
                            </Portal.Host>
                        </Root>
                    </StyleProvider>
                </ContextProvider>
            </I18nextProvider>
        );
    }
}
