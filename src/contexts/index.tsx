import React from "react";

import { AssetConsumer, AssetProvider } from "./AssetContext";
import { BalancesConsumer, BalancesProvider } from "./BalancesContext";
import { ChainConsumer, ChainProvider } from "./ChainContext";
import { ConfigConsumer, ConfigProvider } from "./ConfigContext";
import { PendingTransactionsConsumer, PendingTransactionsProvider } from "./PendingTransactionsContext";
import { SavingsConsumer, SavingsProvider } from "./SavingsContext";

export const ContextProvider = ({ children }) => {
    return (
        <AssetProvider>
            <ChainProvider>
                <BalancesProvider>
                    <SavingsProvider>
                        <PendingTransactionsProvider>
                            <ConfigProvider>{children}</ConfigProvider>
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
                                                <ConfigConsumer>
                                                    {configContext =>
                                                        children({
                                                            ...tokensContext,
                                                            ...walletContext,
                                                            ...savingsContext,
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
                        </SavingsConsumer>
                    )}
                </ChainConsumer>
            )}
        </AssetConsumer>
    );
};
