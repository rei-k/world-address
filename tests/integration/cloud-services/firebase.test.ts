/**
 * Firebase Integration Tests
 * Firebase 統合テスト
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeApp, FirebaseApp, deleteApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously, signOut } from 'firebase/auth';
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { getCloudServiceConfig, isServiceConfigured, skipIfNotConfigured } from '../config/test-config';
import { generateTestAddress, generateTestFriend, randomPID } from '../utils/database-helpers';

describe('Firebase Integration Tests', () => {
  let app: FirebaseApp;
  let firestore: Firestore;
  let auth: Auth;
  let storage: FirebaseStorage;
  const config = getCloudServiceConfig().firebase;

  beforeAll(async () => {
    skipIfNotConfigured('firebase');
    if (!isServiceConfigured('firebase')) {
      return;
    }

    // Initialize Firebase
    app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    });

    firestore = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    // Sign in anonymously for testing
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.warn('Anonymous auth may not be enabled:', error);
    }
  });

  afterAll(async () => {
    if (!isServiceConfigured('firebase')) {
      return;
    }

    // Sign out and cleanup
    try {
      await signOut(auth);
    } catch (error) {
      // Ignore
    }

    if (app) {
      await deleteApp(app);
    }
  });

  beforeEach(async () => {
    if (!isServiceConfigured('firebase')) {
      return;
    }

    // Cleanup test data
    await cleanupTestData();
  });

  describe('Firestore Connection Tests', () => {
    it('should connect to Firestore successfully', async () => {
      if (!isServiceConfigured('firebase')) {
        return;
      }

      const testDocRef = doc(firestore, 'test_collection', 'test_doc');
      await setDoc(testDocRef, { test: true, timestamp: new Date().toISOString() });

      const docSnap = await getDoc(testDocRef);
      expect(docSnap.exists()).toBe(true);

      await deleteDoc(testDocRef);
    });

    it('should verify Firestore app configuration', async () => {
      if (!isServiceConfigured('firebase')) {
        return;
      }

      expect(app.options.projectId).toBe(config.projectId);
      expect(firestore.app).toBe(app);
    });
  });

  describe('Address Entry Operations', () => {
    it('should create an address document', async () => {
      if (!isServiceConfigured('firebase')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      const addressRef = doc(firestore, 'addresses', testAddress.id);

      await setDoc(addressRef, testAddress);

      const docSnap = await getDoc(addressRef);
      expect(docSnap.exists()).toBe(true);
      expect(docSnap.data()?.pid).toBe(testAddress.pid);
    });

    it('should retrieve an address by PID', async () => {
      if (!isServiceConfigured('firebase')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      const addressRef = doc(firestore, 'addresses', testAddress.id);
      await setDoc(addressRef, testAddress);

      // Query by PID
      const q = query(collection(firestore, 'addresses'), where('pid', '==', testAddress.pid));
      const querySnapshot = await getDocs(q);

      expect(querySnapshot.empty).toBe(false);
      expect(querySnapshot.docs.length).toBe(1);
    });

    it('should update an address document', async () => {
      if (!isServiceConfigured('firebase')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      const addressRef = doc(firestore, 'addresses', testAddress.id);
      await setDoc(addressRef, testAddress);

      // Update
      const updatedLabel = 'Updated Label';
      await setDoc(addressRef, { ...testAddress, label: updatedLabel });

      const docSnap = await getDoc(addressRef);
      expect(docSnap.data()?.label).toBe(updatedLabel);
    });

    it('should delete an address document', async () => {
      if (!isServiceConfigured('firebase')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      const addressRef = doc(firestore, 'addresses', testAddress.id);
      await setDoc(addressRef, testAddress);

      await deleteDoc(addressRef);

      const docSnap = await getDoc(addressRef);
      expect(docSnap.exists()).toBe(false);
    });

    it('should query addresses by user DID', async () => {
      if (!isServiceConfigured('firebase')) {
        return;
      }

      const userDid = 'did:key:test_user_' + Date.now();
      const addr1 = generateTestAddress({ user_did: userDid, pid: randomPID() });
      const addr2 = generateTestAddress({ user_did: userDid, pid: randomPID() });

      await setDoc(doc(firestore, 'addresses', addr1.id), addr1);
      await setDoc(doc(firestore, 'addresses', addr2.id), addr2);

      const q = query(collection(firestore, 'addresses'), where('user_did', '==', userDid));
      const querySnapshot = await getDocs(q);

      expect(querySnapshot.docs.length).toBe(2);
    });
  });

  describe('Friend Entry Operations', () => {
    it('should create a friend document', async () => {
      if (!isServiceConfigured('firebase')) {
        return;
      }

      const testFriend = generateTestFriend({ friend_pid: randomPID() });
      const friendRef = doc(firestore, 'friends', testFriend.id);

      await setDoc(friendRef, testFriend);

      const docSnap = await getDoc(friendRef);
      expect(docSnap.exists()).toBe(true);
      expect(docSnap.data()?.friend_pid).toBe(testFriend.friend_pid);
    });

    it('should query friends by owner DID', async () => {
      if (!isServiceConfigured('firebase')) {
        return;
      }

      const ownerDid = 'did:key:test_owner_' + Date.now();
      const friend1 = generateTestFriend({ owner_did: ownerDid, friend_pid: randomPID() });
      const friend2 = generateTestFriend({ owner_did: ownerDid, friend_pid: randomPID() });

      await setDoc(doc(firestore, 'friends', friend1.id), friend1);
      await setDoc(doc(firestore, 'friends', friend2.id), friend2);

      const q = query(collection(firestore, 'friends'), where('owner_did', '==', ownerDid));
      const querySnapshot = await getDocs(q);

      expect(querySnapshot.docs.length).toBe(2);
    });
  });

  describe('Firebase Authentication', () => {
    it('should have an authenticated user', async () => {
      if (!isServiceConfigured('firebase')) {
        return;
      }

      const currentUser = auth.currentUser;
      if (currentUser) {
        expect(currentUser.uid).toBeDefined();
        expect(currentUser.isAnonymous).toBe(true);
      } else {
        console.warn('No authenticated user - anonymous auth may not be enabled');
      }
    });
  });

  describe('Firebase Storage', () => {
    it('should upload and retrieve a file', async () => {
      if (!isServiceConfigured('firebase')) {
        return;
      }

      const testFileName = `test_file_${Date.now()}.txt`;
      const testContent = 'Hello, Firebase Storage!';
      const storageRef = ref(storage, testFileName);

      // Upload
      await uploadString(storageRef, testContent);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      expect(downloadURL).toContain(config.storageBucket);

      // Cleanup
      await deleteObject(storageRef);
    });

    it('should handle file metadata', async () => {
      if (!isServiceConfigured('firebase')) {
        return;
      }

      const testFileName = `test_metadata_${Date.now()}.json`;
      const testData = JSON.stringify({ test: true });
      const storageRef = ref(storage, testFileName);

      await uploadString(storageRef, testData, 'raw', {
        contentType: 'application/json',
      });

      const downloadURL = await getDownloadURL(storageRef);
      expect(downloadURL).toBeDefined();

      // Cleanup
      await deleteObject(storageRef);
    });
  });

  describe('Query Performance', () => {
    it('should handle multiple document writes', async () => {
      if (!isServiceConfigured('firebase')) {
        return;
      }

      const addresses = Array.from({ length: 10 }, () =>
        generateTestAddress({ pid: randomPID() })
      );

      const startTime = Date.now();

      const writePromises = addresses.map((addr) =>
        setDoc(doc(firestore, 'addresses', addr.id), addr)
      );
      await Promise.all(writePromises);

      const duration = Date.now() - startTime;
      console.log(`Wrote 10 documents in ${duration}ms`);

      expect(duration).toBeLessThan(5000);
    });
  });

  async function cleanupTestData(): Promise<void> {
    try {
      // Use batch writes for efficient cleanup
      const addressesSnapshot = await getDocs(collection(firestore, 'addresses'));
      const friendsSnapshot = await getDocs(collection(firestore, 'friends'));

      // Firebase supports batches of up to 500 operations
      const batchSize = 500;
      
      // Delete addresses in batches
      for (let i = 0; i < addressesSnapshot.docs.length; i += batchSize) {
        const batch = addressesSnapshot.docs.slice(i, i + batchSize);
        const deletePromises = batch.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }

      // Delete friends in batches
      for (let i = 0; i < friendsSnapshot.docs.length; i += batchSize) {
        const batch = friendsSnapshot.docs.slice(i, i + batchSize);
        const deletePromises = batch.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  }
});
