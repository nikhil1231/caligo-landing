import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import * as jwt from "jsonwebtoken";
import { FieldValue } from "firebase-admin/firestore";
import validator from "validator";
import cors from "cors";

admin.initializeApp();
const db = admin.firestore();

// Define secrets
const appStoreIssuerId = defineSecret("APP_STORE_ISSUER_ID");
const appStoreKeyId = defineSecret("APP_STORE_KEY_ID");
const appStorePrivateKey = defineSecret("APP_STORE_PRIVATE_KEY");
const appStoreBetaGroupId = defineSecret("APP_STORE_BETA_GROUP_ID");

const corsHandler = cors({ origin: true });

function generateAppleToken(issuerId: string, keyId: string, privateKey: string) {
  // Apple requires ES256, which needs the private key to be formatted properly.
  // The .p8 file content is typically a PEM formatted string.
  // We need to replace any literal \n with actual newlines if stored in a single line in Secret Manager,
  // but Secret Manager often preserves newlines.
  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  const payload = {
    iss: issuerId,
    exp: Math.floor(Date.now() / 1000) + 20 * 60, // 20 minutes from now
    aud: "appstoreconnect-v1",
  };

  return jwt.sign(payload, formattedPrivateKey, {
    algorithm: "ES256",
    keyid: keyId,
  });
}

export const submitLead = onRequest(
  { secrets: [appStoreIssuerId, appStoreKeyId, appStorePrivateKey, appStoreBetaGroupId] },
  (req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          res.status(405).send("Method Not Allowed");
          return;
        }

        const email = req.body.email;
        if (!email || !validator.isEmail(email)) {
          res.status(400).json({ error: "Invalid email address" });
          return;
        }

        const normalizedEmail = validator.normalizeEmail(email) as string || email;

        // Check if email is already in beta list
        const betaRef = db.collection("testFlightBetaTesters");
        const snapshot = await betaRef.where("email", "==", normalizedEmail).get();

        if (!snapshot.empty) {
          res.status(200).json({ message: "Email is already in beta list." });
          return;
        }



        const token = generateAppleToken(
          appStoreIssuerId.value(),
          appStoreKeyId.value(),
          appStorePrivateKey.value()
        );

        const groupId = appStoreBetaGroupId.value();

        const response = await fetch("https://api.appstoreconnect.apple.com/v1/betaTesters", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              type: "betaTesters",
              attributes: {
                email: normalizedEmail,
              },
              relationships: {
                betaGroups: {
                  data: [
                    {
                      id: groupId,
                      type: "betaGroups",
                    },
                  ],
                },
              },
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Apple API Error:", response.status, errorData);

          // Apple API sometimes returns 409 Conflict if the tester already exists globally
          // If it's a 409, we can proceed to add to our database. Otherwise, fail.
          if (response.status !== 409) {
            res.status(500).json({ error: "Failed to add to TestFlight. " + errorData });
            return;
          }
        }

        // Add to our internal Firestore database ONLY if TestFlight succeeded (or 409'd)
        await betaRef.add({
          email: normalizedEmail,
          source: req.body.source || "unknown",
          createdAt: FieldValue.serverTimestamp(),
        });

        res.status(200).json({ message: "Successfully added to waitlist and TestFlight!" });
      } catch (error) {
        console.error("Error processing lead:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  }
);
