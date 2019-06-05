/* tslint:disable:ordered-imports */
import "node-libs-react-native/globals";
import "./globals";
import React from "react";
import { Root, StyleProvider } from "native-base";
import { I18nextProvider } from "react-i18next";
import getTheme from "./native-base-theme/components";
import platform from "./native-base-theme/variables/platform";
import AppContainer from "./src/AppContainer";
import { ContextProvider } from "./src/contexts";
import i18n from "./src/i18n";
import { Portal } from "react-native-paper";

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
