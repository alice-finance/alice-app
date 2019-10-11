import { useCallback, useState } from "react";

import { fetchCollection } from "../utils/firebase-utils";

const useRecentClaimsLoader = () => {
    const [recentClaims, setRecentClaims] = useState<object[] | null>(null);
    const loadRecentClaims = useCallback(async () => {
        setRecentClaims(
            await fetchCollection(ref =>
                ref
                    .doc("events")
                    .collection("Claimed")
                    .orderBy("timestamp", "desc")
                    .limit(5)
            )
        );
    }, []);
    return { loadRecentClaims, recentClaims };
};

export default useRecentClaimsLoader;
