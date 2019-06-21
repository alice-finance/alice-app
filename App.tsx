/* tslint:disable:ordered-imports */
import "node-libs-react-native/globals";
import "./globals";
import "ethers/dist/shims.js";
import React from "react";
import { Root, StyleProvider } from "native-base";
import { I18nextProvider } from "react-i18next";
import getTheme from "./native-base-theme/components";
import platform from "./native-base-theme/variables/platform";
import AppContainer from "./src/AppContainer";
import { ContextProvider } from "./src/contexts";
import i18n from "./src/i18n";
import { Portal } from "react-native-paper";
import { ethers } from "ethers";
import { YellowBox } from "react-native";

YellowBox.ignoreWarnings([
    "Setting a timer"
]);
ethers.errors.setLogLevel("error");

export default class App extends React.Component {
    public render() {
        return (
            <I18nextProvider i18n={i18n}>
                <ContextProvider>
                    <StyleProvider style={getTheme(platform)}>
                        <Root>
                            <Portal.Host>
                                <AppContainer screenProps={{ t: i18n.t }} />
                            </Portal.Host>
                        </Root>
                    </StyleProvider>
                </ContextProvider>
            </I18nextProvider>
        );
    }
}
