import React from "react";

import { BalancesConsumer, BalancesProvider } from "./BalancesContext";
import { ConfigConsumer, ConfigProvider } from "./ConfigContext";
import { ConnectorConsumer, ConnectorProvider } from "./ConnectorContext";
import { PendingTransactionsConsumer, PendingTransactionsProvider } from "./PendingTransactionsContext";
import { SavingsConsumer, SavingsProvider } from "./SavingsContext";
import { TokensConsumer, TokensProvider } from "./TokensContext";

export const ContextProvider = ({ children }) => {
    return (
        <TokensProvider>
            <ConnectorProvider>
                <BalancesProvider>
                    <SavingsProvider>
                        <PendingTransactionsProvider>
                            <ConfigProvider>{children}</ConfigProvider>
                        </PendingTransactionsProvider>
                    </SavingsProvider>
                </BalancesProvider>
            </ConnectorProvider>
        </TokensProvider>
    );
};

export const ContextConsumer = ({ children }) => {
    return (
        <TokensConsumer>
            {tokensContext => (
                <ConnectorConsumer>
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
                </ConnectorConsumer>
            )}
        </TokensConsumer>
    );
};
