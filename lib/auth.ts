import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithRedirect,
  UserCredential
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export const authService = {
  async login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async register(email: string, password: string, displayName?: string): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
    return userCredential;
  },

  async signInWithGoogle(): Promise<UserCredential> {
    return signInWithRedirect(auth, googleProvider);
  },

  async logout(): Promise<void> {
    return signOut(auth);
  },

  async resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
  },

  async sendVerificationEmail(user: any): Promise<void> {
    return sendEmailVerification(user);
  }
};
