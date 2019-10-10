import { useCallback, useState } from "react";

import { fetchCollection } from "../utils/firebase-utils";

const useSavingsLeaderboardLoader = () => {
    const [myRank, setMyRank] = useState<object | null>(null);
    const [savingsLeaderboard, setSavingsLeaderboard] = useState<object[] | null>(null);
    const loadMyRank = useCallback(async (loomAddress: string) => {
        const result = await fetchCollection(ref =>
            ref
                .doc("leaderboard")
                .collection("savings")
                .where("user", "==", loomAddress.toLowerCase())
        );
        setMyRank(result.length === 0 ? null : result[0]);
    }, []);
    const loadSavingsLeaderboard = useCallback(async (count: number) => {
        setSavingsLeaderboard(
            await fetchCollection(ref =>
                ref
                    .doc("leaderboard")
                    .collection("savings")
                    .orderBy("rank", "asc")
                    .limit(count)
            )
        );
    }, []);
    return { loadMyRank, myRank, loadSavingsLeaderboard, savingsLeaderboard };
};

export default useSavingsLeaderboardLoader;
