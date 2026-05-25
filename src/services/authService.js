import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { USER_INDEX_COLLECTION } from './usersAdminService';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

async function ensureMemberFirestoreProfile(firebaseUser) {
  const { uid } = firebaseUser;
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) return;

  const email = firebaseUser.email || '';
  const displayName =
    (firebaseUser.displayName || '').trim() || (email.includes('@') ? email.split('@')[0] : 'Member');

  const batch = writeBatch(db);
  const userPayload = {
    uid,
    email,
    displayName,
    role: 'member',
    createdAt: serverTimestamp(),
  };
  batch.set(userRef, userPayload);
  batch.set(doc(db, USER_INDEX_COLLECTION, uid), {
    displayName,
    email,
    role: 'member',
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

export const registerUser = async (email, password, displayName) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  const uid = credential.user.uid;
  const batch = writeBatch(db);
  const userPayload = {
    uid,
    email,
    displayName,
    role: 'member',
    createdAt: serverTimestamp(),
  };
  batch.set(doc(db, 'users', uid), userPayload);
  batch.set(doc(db, USER_INDEX_COLLECTION, uid), {
    displayName,
    email,
    role: 'member',
    createdAt: serverTimestamp(),
  });
  await batch.commit();
  return credential.user;
};

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

/**
 * Sign in with Google and ensure `users/{uid}` + user index exist (same shape as email registration).
 */
export const signInWithGoogle = async () => {
  const credential = await signInWithPopup(auth, googleProvider);
  await ensureMemberFirestoreProfile(credential.user);
  return credential.user;
};

export const logoutUser = () => signOut(auth);

export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

function trimOrNull(value) {
  if (value == null || typeof value !== 'string') return null;
  const s = value.trim();
  return s.length ? s : null;
}

/**
 * Persist extended member fields to Firestore and sync display name on the Auth user.
 */
export async function saveMemberProfile(firebaseUser, fields) {
  const uid = firebaseUser.uid;
  const displayName = (fields.displayName || '').trim() || firebaseUser.displayName || 'Member';
  await updateProfile(firebaseUser, { displayName });

  const userRef = doc(db, 'users', uid);
  const idxRef = doc(db, USER_INDEX_COLLECTION, uid);
  const [userSnap, idxSnap] = await Promise.all([getDoc(userRef), getDoc(idxRef)]);

  await updateDoc(userRef, {
    displayName,
    email: firebaseUser.email || null,
    phone: trimOrNull(fields.phone),
    address: trimOrNull(fields.address),
    city: trimOrNull(fields.city),
    state: trimOrNull(fields.state),
    zip: trimOrNull(fields.zip),
    dateOfBirth: trimOrNull(fields.dateOfBirth),
    occupation: trimOrNull(fields.occupation),
    ministryInterests: trimOrNull(fields.ministryInterests),
    bio: trimOrNull(fields.bio),
    emergencyContactName: trimOrNull(fields.emergencyContactName),
    emergencyContactPhone: trimOrNull(fields.emergencyContactPhone),
    updatedAt: serverTimestamp(),
  });

  if (!userSnap.exists()) return;

  const u = userSnap.data();
  const indexPayload = {
    displayName,
    email: firebaseUser.email || null,
    role: u.role || 'member',
  };
  if (!idxSnap.exists()) {
    indexPayload.createdAt = u.createdAt || serverTimestamp();
  }
  await setDoc(idxRef, indexPayload, { merge: true });
}
