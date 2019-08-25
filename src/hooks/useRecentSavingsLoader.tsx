import { useCallback, useState } from "react";

import { fetchCollection } from "../utils/firebase-utils";

const useRecentSavingsLoader = () => {
    const [recentSavings, setRecentSavings] = useState<object[] | null>(null);
    const loadRecentSavings = useCallback(async () => {
        setRecentSavings(
            await fetchCollection(ref =>
                ref
                    .doc("events")
                    .collection("SavingsDeposited")
                    .orderBy("timestamp", "desc")
                    .limit(10)
            )
        );
    }, []);
    return { loadRecentSavings, recentSavings };
};

export default useRecentSavingsLoader;
