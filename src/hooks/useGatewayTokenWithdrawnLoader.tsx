import { useContext, useState } from "react";
import { ETHEREUM_FIRST_BLOCK } from "react-native-dotenv";

import { ethers } from "ethers";
import { ConnectorContext } from "../contexts/ConnectorContext";
import Address from "../evm/Address";

const useGatewayTokenWithdrawnLoader = (assetAddress: Address) => {
    const { ethereumConnector } = useContext(ConnectorContext);
    const [withdrawn, setWithdrawn] = useState<TokenWithdrawn[] | null>(null);
    const loadWithdrawn = async () => {
        const gateway = ethereumConnector!.getGateway();
        const event = assetAddress.isNull()
            ? gateway.interface.events.ETHReceived
            : gateway.interface.events.ERC20Received;
        const logs = await ethereumConnector!.provider.getLogs({
            address: gateway.address,
            topics: [event.topic],
            fromBlock: Number(ETHEREUM_FIRST_BLOCK),
            toBlock: "latest"
        });
        setWithdrawn(
            logs
                .sort((l1, l2) => (l2.blockNumber || 0) - (l1.blockNumber || 0))
                .map(log => event.decode(log.data))
                .filter(
                    data =>
                        data.owner === ethereumConnector!.address.toLocalAddressString() &&
                        (assetAddress.isNull() || data.contractAddress === assetAddress.toLocalAddressString())
                )
        );
    };
    return { loadWithdrawn, withdrawn };
};

export interface TokenWithdrawn {
    owner: string;
    kind: string;
    contractAddress: string;
    value: ethers.utils.BigNumber;
}

export default useGatewayTokenWithdrawnLoader;
