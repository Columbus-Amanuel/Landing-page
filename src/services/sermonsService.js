import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

const SERMONS_COLLECTION = 'sermons';

export const getSermons = async (count = 20) => {
  const q = query(
    collection(db, SERMONS_COLLECTION),
    orderBy('date', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getSermonsByCategory = async (category) => {
  const q = query(
    collection(db, SERMONS_COLLECTION),
    where('category', '==', category),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getSermonById = async (id) => {
  const snap = await getDoc(doc(db, SERMONS_COLLECTION, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const uploadSermonAudio = (file, sermonId, onProgress) => {
  const storageRef = ref(storage, `sermons/audio/${sermonId}/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      reject,
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
};

export const createSermon = async (data) =>
  addDoc(collection(db, SERMONS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateSermon = (id, data) =>
  updateDoc(doc(db, SERMONS_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const deleteSermon = async (id, audioPath) => {
  if (audioPath) {
    const audioRef = ref(storage, audioPath);
    await deleteObject(audioRef).catch(() => {});
  }
  return deleteDoc(doc(db, SERMONS_COLLECTION, id));
};
