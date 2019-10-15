/* tslint:disable:max-func-body-length */
import React from "react";

import { AssetConsumer, AssetProvider } from "./AssetContext";
import { BalancesConsumer, BalancesProvider } from "./BalancesContext";
import { ChainConsumer, ChainProvider } from "./ChainContext";
import { ConfigConsumer, ConfigProvider } from "./ConfigContext";
import { EthereumConsumer, EthereumProvider } from "./EthereumContext";
import { PendingTransactionsConsumer, PendingTransactionsProvider } from "./PendingTransactionsContext";
import { SavingsConsumer, SavingsProvider } from "./SavingsContext";

export const ContextProvider = ({ children }) => {
    return (
        <AssetProvider>
            <ChainProvider>
                <BalancesProvider>
                    <SavingsProvider>
                        <PendingTransactionsProvider>
                            <EthereumProvider>
                                <ConfigProvider>{children}</ConfigProvider>
                            </EthereumProvider>
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
                                                <EthereumConsumer>
                                                    {ethereumContext => (
                                                        <ConfigConsumer>
                                                            {configContext =>
                                                                children({
                                                                    ...tokensContext,
                                                                    ...walletContext,
                                                                    ...savingsContext,
                                                                    ...balancesContext,
                                                                    ...pendingTransactionsContext,
                                                                    ...ethereumContext,
                                                                    ...configContext
                                                                })
                                                            }
                                                        </ConfigConsumer>
                                                    )}
                                                </EthereumConsumer>
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
