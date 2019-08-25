import "@firebase/firestore";
import firebase from "firebase";

export const fetchCollection = async (
    query: (ref: firebase.firestore.CollectionReference) => firebase.firestore.Query
) => {
    const array: firebase.firestore.DocumentData[] = [];
    const snapshot = await query(firebase.firestore().collection(__DEV__ ? "extdev" : "plasma")).get();
    snapshot.forEach(doc => {
        array.push(doc.data());
    });
    return array;
};
