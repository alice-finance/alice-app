import { useContext, useState } from "react";
import { ETHEREUM_FIRST_BLOCK } from "react-native-dotenv";

import { ethers } from "ethers";
import { ConnectorContext } from "../contexts/ConnectorContext";
import Address from "../evm/Address";
import { getLogs } from "../utils/ethers-utils";

const useGatewayTokenWithdrawnLoader = (assetAddress: Address) => {
    const { ethereumConnector } = useContext(ConnectorContext);
    const [withdrawn, setWithdrawn] = useState<TokenWithdrawn[] | null>(null);
    const loadWithdrawn = async () => {
        const gateway = ethereumConnector!.getGateway();
        const event = gateway.interface.events.TokenWithdrawn;
        const toBlock = Number(await ethereumConnector!.provider.getBlockNumber());
        const logs = await getLogs(ethereumConnector!.provider, {
            address: gateway.address,
            topics: [event.topic, event.encodeTopics([ethereumConnector!.address.toLocalAddressString()])],
            fromBlock: Number(ETHEREUM_FIRST_BLOCK),
            toBlock
        });
        setWithdrawn(
            logs
                .sort((l1, l2) => (l2.blockNumber || 0) - (l1.blockNumber || 0))
                .map(log => ({
                    ...event.decode(log.data),
                    blockNumber: log.blockNumber
                }))
                .filter(data => Address.newEthereumAddress(data.contractAddress).equals(assetAddress))
        );
    };
    return { loadWithdrawn, withdrawn };
};

export interface TokenWithdrawn {
    owner: string;
    kind: string;
    contractAddress: string;
    value: ethers.utils.BigNumber;
    blockNumber: number;
}

export default useGatewayTokenWithdrawnLoader;
