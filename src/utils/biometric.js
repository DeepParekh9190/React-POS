function bufToBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64ToBuf(str) {
  return Uint8Array.from(atob(str.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
}

export async function isBiometricAvailable() {
  if (!window.PublicKeyCredential) return false;
  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch { return false; }
}

export async function registerBiometric(userId) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const user = { id: new TextEncoder().encode(userId), name: userId, displayName: userId };

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { id: window.location.hostname || "localhost", name: "Pulse POS" },
      user,
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
      timeout: 60000,
    },
  });

  return {
    credentialId: bufToBase64(credential.rawId),
    transports: credential.response.getTransports?.() || [],
  };
}

export async function verifyBiometric(credentialIdBase64) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const credentialId = base64ToBuf(credentialIdBase64);

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{
        id: credentialId,
        type: "public-key",
        transports: ["internal"],
      }],
      userVerification: "required",
      timeout: 60000,
    },
  });

  return !!assertion;
}
