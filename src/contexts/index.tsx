import React from "react";

import { AssetConsumer, AssetProvider } from "./AssetContext";
import { BalancesConsumer, BalancesProvider } from "./BalancesContext";
import { ChainConsumer, ChainProvider } from "./ChainContext";
import { ConfigConsumer, ConfigProvider } from "./ConfigContext";
import { NotificationConsumer, NotificationProvider } from "./NotificationContext";
import { PendingTransactionsConsumer, PendingTransactionsProvider } from "./PendingTransactionsContext";
import { SavingsConsumer, SavingsProvider } from "./SavingsContext";

export const ContextProvider = ({ children }) => {
    return (
        <AssetProvider>
            <ChainProvider>
                <BalancesProvider>
                    <SavingsProvider>
                        <PendingTransactionsProvider>
                            <NotificationProvider>
                                <ConfigProvider>{children}</ConfigProvider>
                            </NotificationProvider>
                        </PendingTransactionsProvider>
                    </SavingsProvider>
                </BalancesProvider>
            </ChainProvider>
        </AssetProvider>
    );
};

export const ContextConsumer = ({ children }) => {
    return (
        <AssetConsumer>
            {tokensContext => (
                <ChainConsumer>
                    {walletContext => (
                        <SavingsConsumer>
                            {savingsContext => (
                                <BalancesConsumer>
                                    {balancesContext => (
                                        <PendingTransactionsConsumer>
                                            {pendingTransactionsContext => (
                                                <NotificationConsumer>
                                                    {notificationContext => (
                                                        <ConfigConsumer>
                                                            {configContext =>
                                                                children({
                                                                    ...tokensContext,
                                                                    ...walletContext,
                                                                    ...savingsContext,
                                                                    ...balancesContext,
                                                                    ...pendingTransactionsContext,
                                                                    ...notificationContext,
                                                                    ...configContext
                                                                })
                                                            }
                                                        </ConfigConsumer>
                                                    )}
                                                </NotificationConsumer>
                                            )}
                                        </PendingTransactionsConsumer>
                                    )}
                                </BalancesConsumer>
                            )}
                        </SavingsConsumer>
                    )}
                </ChainConsumer>
            )}
        </AssetConsumer>
    );
};
