import * as jose from 'jose';

let privateKey: jose.KeyLike | null = null;
let publicKey: jose.KeyLike | null = null;

async function loadKeys() {
  if (!privateKey || !publicKey) {
    const privPem = process.env['JWT_PRIVATE_KEY_PEM'];
    const pubPem = process.env['JWT_PUBLIC_KEY_PEM'];

    if (privPem && pubPem) {
      privateKey = await jose.importPKCS8(privPem.replace(/\\n/g, '\n'), 'EdDSA');
      publicKey = await jose.importSPKI(pubPem.replace(/\\n/g, '\n'), 'EdDSA');
    } else {
      // Generate ephemeral keys for development
      const { privateKey: priv, publicKey: pub } = await jose.generateKeyPair('EdDSA');
      privateKey = priv;
      publicKey = pub;
    }
  }
  return { privateKey: privateKey!, publicKey: publicKey! };
}

const ACCESS_TTL = Number(process.env['ACCESS_TOKEN_TTL'] ?? 900); // 15 min
const REFRESH_TTL = Number(process.env['REFRESH_TOKEN_TTL'] ?? 2592000); // 30 days

export interface JwtPayload {
  sub: string;
  role: string;
  email: string;
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  const { privateKey } = await loadKeys();
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'EdDSA' })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL}s`)
    .setIssuer('tregprone')
    .sign(privateKey);
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const { publicKey } = await loadKeys();
  const { payload } = await jose.jwtVerify(token, publicKey, { issuer: 'tregprone' });
  return payload as unknown as JwtPayload;
}

export async function getJwks() {
  const { publicKey } = await loadKeys();
  return jose.exportJWK(publicKey);
}

export { ACCESS_TTL, REFRESH_TTL };
