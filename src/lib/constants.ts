// All values sourced from the deployed website (.env.local + contracts/.env)
export const API_BASE = "https://tefama-website.vercel.app";

// Google OAuth — same client ID used by the website
// Authorized redirect URIs that MUST be registered in Google Cloud Console:
//   https://auth.expo.io/@tevinprime66/tefama-mobile  (Expo Go / dev)
//   tefama://                                          (standalone build)
//   https://tefama-website.vercel.app/auth/callback    (website — already registered)
export const GOOGLE_CLIENT_ID =
  "957943839070-t04phlgelucr59492rs3arvq8sf362bp.apps.googleusercontent.com";

// Sui network
export const NETWORK      = "testnet";
export const EXPLORER_BASE = "https://suiscan.xyz/testnet/tx";

// On-chain identifiers (from contracts/.env)
export const VAULT_ID =
  "0x5df5e7eaed1dfdce2df6471d94d76de49d7da86ce4c1e20547ca8f74e29a3fb2";
export const TEFAMA_PACKAGE_ID =
  "0xf8cfd942cfe8332f0d98e3dbab38d26c3ea641531010e1bbf06e45c0199d97a1";
export const DEEPBOOK_PKG =
  "0x22be4cade64bf2d02412c7e8d0e8beea2f78828b948118d46735315409371a3c";
export const POOL_ID =
  "0x48c95963e9eac37a316b7ae04a0deb761bcdcc2b67912374d6036e7f0e9bae9f";
export const BALANCE_MANAGER_ID =
  "0xfca64c32e2b0ad1cdecbd30863b35a5684a27ef1409392f72b2e94066e5f486c";
export const CAP_ID =
  "0x4374d61dbe982171685c24cf30aff21605b557ecb144e52dd5abf34e6bc81cec";
export const AGENT_ADDRESS =
  "0xd72e8ed6f0ecbddd9672646e444245695e3d3462c940715f268c8e4997c7d968";

// Coin types
export const QUOTE_TYPE = "0x2::sui::SUI";
export const BASE_TYPE  =
  "0x36dbef866a1d62bf7328989a10fb2f07d769f4ee587c0de4a0a256e57e0a58a8::deep::DEEP";
export const DEEP_TYPE  =
  "0x36dbef866a1d62bf7328989a10fb2f07d769f4ee587c0de4a0a256e57e0a58a8::deep::DEEP";

// DCA clip size (in MIST — 300_000_000 = 0.3 SUI)
export const DCA_CLIP = 300_000_000;

// zkLogin salt — same secret used by the website backend
// The API at ${API_BASE}/api/zklogin/salt uses HMAC-SHA256(sub, ZKLOGIN_SALT_SECRET)
// This constant is informational only; the salt is fetched from the API, not computed in-app
export const ZKLOGIN_SALT_SECRET = "tefama-hackathon-sui-2025-salt-secret-xyz";
