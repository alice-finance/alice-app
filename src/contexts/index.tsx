import React from "react";

import { BalancesConsumer, BalancesProvider } from "./BalancesContext";
import { ConfigConsumer, ConfigProvider } from "./ConfigContext";
import { PendingTransactionsConsumer, PendingTransactionsProvider } from "./PendingTransactionsContext";
import { SavingsConsumer, SavingsProvider } from "./SavingsContext";
import { TokensConsumer, TokensProvider } from "./TokensContext";
import { WalletConsumer, WalletProvider } from "./WalletContext";

export const ContextProvider = ({ children }) => {
    return (
        <TokensProvider>
            <WalletProvider>
                <BalancesProvider>
                    <SavingsProvider>
                        <PendingTransactionsProvider>
                            <ConfigProvider>{children}</ConfigProvider>
                        </PendingTransactionsProvider>
                    </SavingsProvider>
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
                </WalletConsumer>
            )}
        </TokensConsumer>
    );
};
