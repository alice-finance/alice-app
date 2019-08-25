import { useCallback, useState } from "react";

import { fetchCollection } from "../utils/firebase-utils";

const useSavingsLeaderboardLoader = () => {
    const [savingsLeaderboard, setSavingsLeaderboard] = useState<object[] | null>(null);
    const loadSavingsLeaderboard = useCallback(async () => {
        setSavingsLeaderboard(
            await fetchCollection(ref =>
                ref
                    .doc("leaderboard")
                    .collection("savings")
                    .orderBy("rank", "asc")
                    .limit(10)
            )
        );
    }, []);
    return { loadSavingsLeaderboard, savingsLeaderboard };
};

export default useSavingsLeaderboardLoader;
