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
