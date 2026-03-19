PQFS notes (alpha)
- Hybrid KEM: Kyber768 + X25519 ephemeral
- Signatures for attestations: Dilithium3 + Ed25519 hybrid stack
- Symmetric: HKDF-SHA512 -> AES-256-GCM or XChaCha20-Poly1305
- Use threshold HSM (CloudHSM/HashiCorp HSM) or MPC for any unseal/attestation release.
- In CI never store private keys; use Vault/Secrets manager and ephemeral tokens for test runs.
