const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.finalizeUpgrade = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { tierId, paymentData } = data;
  const uid = context.auth.uid;

  // Validate the tierId
  if (tierId !== "pro" && tierId !== "roastery") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid membership tier specified."
    );
  }

  // In a full production environment, we would verify paymentData with the PayPal API here.
  // Example: 
  // const order = await paypalClient.orders.get(paymentData.orderID);
  // if (order.result.status !== 'COMPLETED') throw Error("Payment not completed");

  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);

  try {
    const profileRef = admin.firestore().collection("profiles").doc(uid);
    await profileRef.update({
      membership: tierId,
      subscriptionExpiry: admin.firestore.Timestamp.fromDate(expiry),
      lastPaymentId: paymentData.payment_id || paymentData.orderID || "PAYPAL_HOSTED_VERIFIED",
      lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Successfully upgraded user ${uid} to ${tierId}`);
    return { success: true, tierId, expiry };
  } catch (error) {
    console.error("Error upgrading membership:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to update user profile."
    );
  }
});

const LEVEL_THRESHOLDS = [0, 500, 1200, 2500, 5000, 10000];
const ALL_BADGES = [
  { id: 'first_cupping', name: 'First Sip', icon: '🌱', description: 'Completed your first cupping session.' }
];

exports.processCuppingGamification = functions.firestore
  .document('cuppings/{cuppingId}')
  .onCreate(async (snap, context) => {
    const session = snap.data();
    const userId = session.userId;
    if (!userId) return null;

    const profileRef = admin.firestore().collection('profiles').doc(userId);
    
    return admin.firestore().runTransaction(async (transaction) => {
      const profileSnap = await transaction.get(profileRef);
      if (!profileSnap.exists) return null;
      
      const profile = profileSnap.data();
      
      // Calculate XP
      let xpGain = 100;
      if (session.finalScore >= 80) xpGain += 50;
      xpGain += (session.flavorNotes?.length || 0) * 10;

      const newXp = (profile.xp || 0) + xpGain;
      const newSessions = (profile.totalSessions || 0) + 1;
      
      // Determine Level
      let newLevel = profile.level || 1;
      for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (newXp >= LEVEL_THRESHOLDS[i]) {
          newLevel = i + 1;
          break;
        }
      }

      // Determine Avatar Stage
      let avatarStage = 'seedling';
      if (newLevel >= 5) avatarStage = 'harvest';
      else if (newLevel >= 4) avatarStage = 'cherry';
      else if (newLevel >= 3) avatarStage = 'flowering';
      else if (newLevel >= 2) avatarStage = 'sprout';

      // Check Badges
      const currentBadgeIds = (profile.badges || []).map(b => b.id);
      const newBadges = [...(profile.badges || [])];
      if (!currentBadgeIds.includes('first_cupping')) {
        const badge = ALL_BADGES.find(b => b.id === 'first_cupping');
        if (badge) {
          newBadges.push({ ...badge, unlockedAt: admin.firestore.Timestamp.now() });
        }
      }

      transaction.update(profileRef, {
        xp: newXp,
        totalSessions: newSessions,
        level: newLevel,
        avatarStage: avatarStage,
        badges: newBadges,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
  });
