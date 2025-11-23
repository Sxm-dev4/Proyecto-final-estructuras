import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;
let db: Firestore;
let auth: Auth;

/**
 * Inicializa Firebase Admin SDK (solo en servidor)
 */
export function initAdmin() {
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });

    db = getFirestore(app);
    auth = getAuth(app);
  } else {
    app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
  }

  return { app, db, auth };
}

export function getAdminDB(): Firestore {
  if (!db) {
    initAdmin();
  }
  return db;
}

export function getAdminAuth(): Auth {
  if (!auth) {
    initAdmin();
  }
  return auth;
}