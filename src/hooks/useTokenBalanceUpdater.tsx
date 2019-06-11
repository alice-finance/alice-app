import { useCallback, useContext, useState } from "react";

import { BalancesContext } from "../contexts/BalancesContext";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { TokensContext } from "../contexts/TokensContext";

const useTokenBalanceUpdater = () => {
    const { tokens } = useContext(TokensContext);
    const { updateBalance } = useContext(BalancesContext);
    const { ethereumConnector, loomConnector } = useContext(ConnectorContext);
    const [updating, setUpdating] = useState(false);
    const update = useCallback(async () => {
        setUpdating(true);
        try {
            if (ethereumConnector && loomConnector) {
                await Promise.all([
                    ethereumConnector.fetchERC20Balances(tokens, updateBalance),
                    loomConnector.fetchERC20Balances(tokens, updateBalance)
                ]);
            }
        } finally {
            setUpdating(false);
        }
    }, [tokens, ethereumConnector, loomConnector]);
    return { updating, update };
};

export default useTokenBalanceUpdater;
