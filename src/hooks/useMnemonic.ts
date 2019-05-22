import { useEffect, useState } from "react";

import { SecureStore } from "expo";

const useMnemonic = () => {
    const [loaded, setLoaded] = useState(false);
    const [mnemonic, setMnemonic] = useState<string | null>(null);
    useEffect(() => {
        SecureStore.getItemAsync("mnemonic")
            .then(setMnemonic)
            .finally(() => setLoaded(true));
    });
    return { mnemonicLoaded: loaded, mnemonic };
};

export default useMnemonic;
