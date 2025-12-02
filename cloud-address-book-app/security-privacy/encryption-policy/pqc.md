# PQC（Post-Quantum Cryptography）/ 量子コンピュータ耐性暗号

将来の量子コンピュータ攻撃に耐えうる暗号化方式。

Encryption methods resistant to future quantum computer attacks.

---

## 🔐 概要 / Overview

PQC（Post-Quantum Cryptography、耐量子計算機暗号）は、量子コンピュータによる攻撃にも耐えられる暗号化アルゴリズムです。

---

## 🛡️ 採用アルゴリズム / Adopted Algorithms

### CRYSTALS-Kyber
- **用途**: 鍵カプセル化機構（KEM）
- **セキュリティレベル**: NIST Level 3
- **状態**: NIST標準化候補

### CRYSTALS-Dilithium
- **用途**: デジタル署名
- **セキュリティレベル**: NIST Level 3
- **状態**: NIST標準化候補

---

## 💻 使用例 / Usage Example

### PQC暗号化

```typescript
import { encryptWithPQC } from '@/cloud-address-book-app/security-privacy/encryption-policy';

const encrypted = await encryptWithPQC(addressData, {
  algorithm: 'CRYSTALS-Kyber',
  securityLevel: 5,
  publicKey: recipientPublicKey
});
```

### PQC署名

```typescript
import { signWithPQC } from '@/cloud-address-book-app/security-privacy/encryption-policy';

const signed = await signWithPQC(addressData, {
  algorithm: 'CRYSTALS-Dilithium',
  securityLevel: 5,
  privateKey: userPrivateKey
});
```

---

## 🔄 移行計画 / Migration Plan

### ハイブリッド暗号化

現在の暗号化とPQCを併用し、段階的に移行します。

```
Phase 1: 従来の暗号化のみ（現在）
Phase 2: ハイブリッド暗号化（従来 + PQC）
Phase 3: PQCのみ（将来）
```

---

## 📚 参考資料 / References

- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [CRYSTALS-Kyber](https://pq-crystals.org/kyber/)
- [CRYSTALS-Dilithium](https://pq-crystals.org/dilithium/)

---

**🌐 World Address YAML / JSON** - Post-Quantum Cryptography
