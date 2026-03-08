import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const submitChurchProfileUpdate = (data, user) => addDoc(collection(db, 'churchProfileUpdates'), {
  ...data,
  submittedByUid: user.uid,
  submittedByEmail: user.email || null,
  submittedAt: serverTimestamp(),
  status: 'new',
});
