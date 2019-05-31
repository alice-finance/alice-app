import React from "react";

import { BalancesConsumer, BalancesProvider } from "./BalancesContext";
import { ConfigConsumer, ConfigProvider } from "./ConfigContext";
import { PendingTransactionsConsumer, PendingTransactionsProvider } from "./PendingTransactionsContext";
import { TokensConsumer, TokensProvider } from "./TokensContext";
import { WalletConsumer, WalletProvider } from "./WalletContext";

export const ContextProvider = ({ children }) => {
    return (
        <TokensProvider>
            <WalletProvider>
                <BalancesProvider>
                    <PendingTransactionsProvider>
                        <ConfigProvider>{children}</ConfigProvider>
                    </PendingTransactionsProvider>
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
                                <PendingTransactionsConsumer>
                                    {pendingTransactionsContext => (
                                        <ConfigConsumer>
                                            {configContext =>
                                                children({
                                                    ...tokensContext,
                                                    ...walletContext,
                                                    ...balancesContext,
                                                    ...pendingTransactionsContext,
                                                    ...configContext
                                                })
                                            }
                                        </ConfigConsumer>
                                    )}
                                </PendingTransactionsConsumer>
                            )}
                        </BalancesConsumer>
                    )}
                </WalletConsumer>
            )}
        </TokensConsumer>
    );
};
