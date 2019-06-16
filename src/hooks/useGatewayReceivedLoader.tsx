import { useContext, useState } from "react";
import { ETHEREUM_FIRST_BLOCK } from "react-native-dotenv";

import { ethers } from "ethers";
import { ConnectorContext } from "../contexts/ConnectorContext";
import Address from "../evm/Address";

const useGatewayReceivedLoader = (assetAddress: Address) => {
    const { ethereumConnector } = useContext(ConnectorContext);
    const [received, setReceived] = useState<Array<ETHReceived | ERC20Received> | null>(null);
    const loadReceived = async () => {
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
        setReceived(
            logs
                .map(log => event.decode(log.data))
                .filter(
                    data =>
                        data.from === ethereumConnector!.address.toLocalAddressString() &&
                        (assetAddress.isNull() || data.contractAddress === assetAddress.toLocalAddressString())
                )
        );
    };
    return { loadReceived, received };
};

export interface ETHReceived {
    from: string;
    amount: ethers.utils.BigNumber;
}

export interface ERC20Received {
    from: string;
    amount: ethers.utils.BigNumber;
    contractAddress: string;
}

export default useGatewayReceivedLoader;
