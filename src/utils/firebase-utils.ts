import "@firebase/firestore";
import firebase from "firebase";

export const fetchCollection = async (query: (firestore: firebase.firestore.Firestore) => firebase.firestore.Query) => {
    const array: firebase.firestore.DocumentData[] = [];
    const snapshot = await query(firebase.firestore()).get();
    snapshot.forEach(doc => {
        array.push(doc.data());
    });
    return array;
};
