import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();

// --- 1. EMAIL & PASSWORD LOGIC ---
export const registerUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

// --- 2. PASSWORDLESS (MAGIC LINK) LOGIC ---
const actionCodeSettings = {
    // URL you want to redirect back to. Must be whitelisted in Firebase Console!
    url: window.location.href, 
    handleCodeInApp: true,
};

export const sendMagicLink = async (email) => {
    try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        // Save email locally to avoid asking the user again on the same device
        window.localStorage.setItem('emailForSignIn', email);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// --- 3. HANDLE REDIRECT (Run this on page load) ---
export const handleAuthRedirect = async () => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        
        // If user opened link on a different device, ask for email again
        if (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }

        try {
            const result = await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            return result.user;
        } catch (error) {
            console.error("Link Error:", error.code);
        }
    }
    return null;
};