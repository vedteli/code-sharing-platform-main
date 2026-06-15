import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export async function getLatestCode(): Promise<string> {
  try {
    const q = query(
      collection(db, 'codes'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return 'No code snippets found';
    }

    const latestDoc = querySnapshot.docs[0];
    const codeData = latestDoc.data();

    return codeData.content || '';
  } catch (error) {
    console.error('Error fetching latest code:', error);
    return 'Error fetching code snippet';
  }
}

export async function getLatestCodeWithMetadata() {
  try {
    const q = query(
      collection(db, 'codes'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const latestDoc = querySnapshot.docs[0];
    const codeData = latestDoc.data();

    return {
      id: latestDoc.id,
      ...codeData
    };
  } catch (error) {
    console.error('Error fetching latest code:', error);
    return null;
  }
}
