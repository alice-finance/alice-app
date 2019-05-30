import React from "react";

import { BalancesConsumer, BalancesProvider } from "./BalancesContext";
import { ConfigConsumer, ConfigProvider } from "./ConfigContext";
import { TokensConsumer, TokensProvider } from "./TokensContext";
import { WalletConsumer, WalletProvider } from "./WalletContext";

export const ContextProvider = ({ children }) => {
    return (
        <TokensProvider>
            <WalletProvider>
                <BalancesProvider>
                    <ConfigProvider>{children}</ConfigProvider>
                </BalancesProvider>
            </WalletProvider>
        </TokensProvider>
    );
};

export const ContextConsumer = ({ children }) => {
    return (
        <TokensConsumer>
            {tokensContext => (
                <WalletConsumer>
                    {walletContext => (
                        <BalancesConsumer>
                            {balancesContext => (
                                <ConfigConsumer>
                                    {configContext =>
                                        children({
                                            ...tokensContext,
                                            ...walletContext,
                                            ...balancesContext,
                                            ...configContext
                                        })
                                    }
                                </ConfigConsumer>
                            )}
                        </BalancesConsumer>
                    )}
                </WalletConsumer>
            )}
        </TokensConsumer>
    );
};
