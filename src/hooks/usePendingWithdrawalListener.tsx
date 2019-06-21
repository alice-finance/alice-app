import { useContext, useEffect, useState } from "react";

import { IWithdrawalReceipt, TransferGateway } from "loom-js/dist/contracts/transfer-gateway";
import { TransferGatewayTokenKind } from "loom-js/dist/proto/transfer_gateway_pb";
import { ConnectorContext } from "../contexts/ConnectorContext";
import ERC20Token from "../evm/ERC20Token";
import { toBigNumber } from "../utils/big-number-utils";
import useEthereumBlockNumberListener from "./useEthereumBlockNumberListener";

const usePendingWithdrawalListener = (asset: ERC20Token) => {
    const { loomConnector, ethereumConnector } = useContext(ConnectorContext);
    const { blockNumber } = useEthereumBlockNumberListener();
    const [receipt, setReceipt] = useState<IWithdrawalReceipt | null>();
    useEffect(() => {
        const refresh = async () => {
            const loomGateway = await TransferGateway.createAsync(loomConnector!.client, loomConnector!.address);
            const ethereumGateway = ethereumConnector!.getGateway();
            const r = await loomGateway.withdrawalReceiptAsync(loomConnector!.address);
            setReceipt(null);
            if (r) {
                const loomNonce = r.withdrawalNonce.toString();
                const ethereumNonce = await ethereumGateway.nonces(ethereumConnector!.address.toLocalAddressString());
                if (
                    toBigNumber(ethereumNonce).eq(toBigNumber(loomNonce)) &&
                    ((asset.ethereumAddress.isNull() && r.tokenKind === TransferGatewayTokenKind.ETH) ||
                        r.tokenContract.local.equals(asset.ethereumAddress.local))
                ) {
                    setReceipt(r);
                }
            }
        };
        refresh();
    }, [blockNumber]);
    return { receipt };
};

export default usePendingWithdrawalListener;
