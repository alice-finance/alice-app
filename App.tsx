/* tslint:disable:ordered-imports */
import "node-libs-react-native/globals";
import "./globals";
import React from "react";
import { Root, StyleProvider } from "native-base";
import { I18nextProvider } from "react-i18next";
import getTheme from "./native-base-theme/components";
import platform from "./native-base-theme/variables/platform";
import AppContainer from "./src/AppContainer";
import i18n from "./src/i18n";

export default class App extends React.Component {
    public render() {
        return (
            <I18nextProvider i18n={i18n}>
                <StyleProvider style={getTheme(platform)}>
                    <Root>
                        <AppContainer />
                    </Root>
                </StyleProvider>
            </I18nextProvider>
        );
    }
}
