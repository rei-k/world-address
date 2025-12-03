# 住所クラウド検索エンジン - アルゴリズム・技術スタック / Address Cloud Search Engine - Algorithms & Tech Stack

このドキュメントでは、住所クラウド検索エンジンの能力を向上させるために使用されるアルゴリズムと、それに関連する主要な技術スタックを詳細に説明します。

This document provides a comprehensive explanation of the algorithms used to enhance the address cloud search engine capabilities, along with their associated technical stacks.

---

## 目次 / Table of Contents

1. [概要](#概要--overview)
2. [1. 住所意味理解による検索精度向上](#1-住所意味理解による検索精度向上)
3. [2. 類似住所・揺れ吸収による検索能力向上](#2-類似住所揺れ吸収による検索能力向上)
4. [3. 履歴学習・優先抽出による検索UX高速化](#3-履歴学習優先抽出による検索ux高速化)
5. [4. 不正・ノイズ除外による検索信頼性向上](#4-不正ノイズ除外による検索信頼性向上)
6. [技術スタックまとめ](#技術スタックまとめ--technology-stack-summary)
7. [実装ロードマップ](#実装ロードマップ--implementation-roadmap)

---

## 概要 / Overview

住所クラウド検索エンジンは、単なる文字列検索ではなく、住所の構造・意味・文法・類似性を理解する高度なAI検索システムです。

The address cloud search engine is an advanced AI-powered search system that understands the structure, semantics, grammar, and similarity of addresses beyond simple string matching.

### 4つの主軸アルゴリズム分野

1. **住所意味理解** - 構造として理解し、階層・文法・位置関係を解析
2. **類似住所吸収** - 表記揺れ・他言語表記・略称を同一PIDに収束
3. **履歴学習最適化** - 利用頻度・相性・サービス適合をスコア化して優先表示
4. **不正・ノイズ除外** - 異常検知・レート制御で信頼性を維持

これらのアルゴリズムを組み合わせることで、**住所入力なしで検索だけでチェックアウト/予約成立**というシステムが実現します。

---

## 1. 住所意味理解による検索精度向上

### 概要

住所を単なる文字列ではなく構造として理解し、階層・文法・位置関係を解析するAIインデックスを構築します。
これにより、国ごとに異なる住所文法も学習でき、確率的文法や構造化検索が可能になります。

### 使用アルゴリズム

#### 1.1 Probabilistic Context-Free Grammar (PCFG)

**役割**: 住所表記の文法揺れに対応

住所は国や地域によって異なる文法構造を持ちます。PCFGを使用することで、確率的に住所の構成要素を解析できます。

**技術詳細**:
```
文法ルール例（日本）:
Address → PostalCode Prefecture City Street Building [0.8]
Address → Prefecture City Street PostalCode [0.15]
Address → City Prefecture Street [0.05]

Prefecture → "東京都" [0.12] | "大阪府" [0.08] | ...
City → "渋谷区" [0.03] | "新宿区" [0.04] | ...
```

**実装技術スタック**:
- **パーサー**: NLTK (Natural Language Toolkit), spaCy
- **文法定義**: CFG (Context-Free Grammar) with probabilistic weights
- **学習**: Maximum Likelihood Estimation from annotated address corpus
- **最適化**: CYK (Cocke-Younger-Kasami) algorithm for parsing

**適用例**:
```typescript
// 入力: "150-0001 東京都渋谷区神宮前1-1-1"
// または: "東京都渋谷区神宮前1-1-1 150-0001"
// → 両方とも同じPID構造に正規化
parseAddress(input: string, country: string) {
  const grammar = loadPCFG(country);
  const parsed = grammar.parse(input);
  return normalizeToStructure(parsed);
}
```

**利点**:
- 住所の並び順の違いを吸収
- 省略された要素を確率的に補完
- 国ごとの文法パターンを学習可能

---

#### 1.2 Abstract Syntax Tree (AST)

**役割**: 住所の構造をツリーで検索

住所の階層構造をツリーとして表現し、効率的な検索とマッチングを実現します。

**技術詳細**:
```
住所AST構造例:
JP (Country)
└─ 13 (Admin1: Tokyo)
   └─ 113 (Admin2: Shibuya)
      └─ 01 (Locality)
         └─ T07 (Sublocality)
            └─ B12 (Block)
               └─ BN02 (Building)
                  └─ R342 (Unit)
```

**実装技術スタック**:
- **データ構造**: Tree nodes with hierarchical relationships
- **検索アルゴリズム**: Depth-First Search (DFS), Breadth-First Search (BFS)
- **インデックス**: B-tree, R-tree for spatial indexing
- **言語**: TypeScript/JavaScript (runtime), Python (ML processing)

**適用例**:
```typescript
class AddressNode {
  level: AddressLevel;
  code: string;
  children: AddressNode[];
  parent: AddressNode | null;
  
  // ツリー内検索
  findByPath(path: string[]): AddressNode | null {
    if (path.length === 0) return this;
    const nextCode = path[0];
    const child = this.children.find(c => c.code === nextCode);
    return child?.findByPath(path.slice(1)) ?? null;
  }
  
  // 親階層を含む検索
  matchesPartial(query: Partial<PID>): boolean {
    // 部分一致検索ロジック
  }
}
```

**利点**:
- 階層的な住所検索が高速
- 親子関係を保ったまま検索可能
- 部分一致検索が効率的

---

#### 1.3 Directed Acyclic Graph (DAG)

**役割**: 住所階層と地域関係の最適検索構造

住所の階層構造は単純なツリーではなく、複数の親を持つ場合があります（例: 特別行政区画）。DAGを使用することで、複雑な地域関係も表現できます。

**技術詳細**:
```
DAG構造例（東京都特別区）:
JP (Country)
├─ 13 (Tokyo-to)
│  ├─ 101 (Chiyoda-ku) ─┐
│  ├─ 102 (Chuo-ku)     ├─ Special Ward Area
│  └─ 103 (Minato-ku)   ┘
└─ Postal Zone Grouping
   ├─ 100-xxxx (Central Tokyo)
   └─ 150-xxxx (Shibuya Area)
```

**実装技術スタック**:
- **グラフDB**: Neo4j, ArangoDB, Amazon Neptune
- **アルゴリズム**: Topological Sort, Dijkstra's algorithm
- **クエリ言語**: Cypher (Neo4j), AQL (ArangoDB)
- **最適化**: Graph indexing, materialized paths

**適用例**:
```cypher
// Neo4jでの住所検索クエリ例
MATCH (country:Country {code: 'JP'})
  -[:HAS_ADMIN1]->(admin1:Admin1 {code: '13'})
  -[:HAS_ADMIN2]->(admin2:Admin2)
  -[:HAS_LOCALITY]->(locality:Locality)
WHERE locality.postalCode STARTS WITH '150'
RETURN admin2, locality
```

**利点**:
- 複雑な地域関係を正確に表現
- 郵便番号ゾーンと行政区画の交差検索
- グラフアルゴリズムで最短経路検索可能

---

#### 1.4 Merkle Tree

**役割**: 住所一致と包含の高速照合

Merkle Treeを使用することで、住所の一致判定や包含関係の検証を高速かつ安全に実行できます。

**技術詳細**:
```
Merkle Tree構造:
                Root Hash
               /          \
         Hash(A,B)      Hash(C,D)
         /      \        /      \
    Hash(A)  Hash(B)  Hash(C)  Hash(D)
       |        |        |        |
     PID-A    PID-B    PID-C    PID-D

A = JP-13-113-01
B = JP-13-113-02
C = JP-13-114-01
D = JP-13-114-02
```

**実装技術スタック**:
- **ハッシュ関数**: SHA-256, BLAKE2
- **データ構造**: Binary Merkle Tree
- **検証**: Merkle proof for address verification
- **ストレージ**: Redis (cache), PostgreSQL (persistence)

**適用例**:
```typescript
class AddressMerkleTree {
  root: MerkleNode;
  
  // 住所の包含検証
  verifyInclusion(pid: string, proof: MerkleProof): boolean {
    const leafHash = hash(pid);
    let currentHash = leafHash;
    
    for (const sibling of proof.siblings) {
      currentHash = hash(currentHash + sibling);
    }
    
    return currentHash === this.root.hash;
  }
  
  // 住所範囲の一致検証
  verifyRange(startPID: string, endPID: string): boolean {
    // 範囲内のすべての住所が存在することを検証
  }
}
```

**利点**:
- 住所データベースの整合性検証
- 高速な包含判定（O(log n)）
- 改ざん検知が可能
- ZK証明との統合が容易

---

## 2. 類似住所・揺れ吸収による検索能力向上

### 概要

同一住所でも表記揺れや他言語表記が発生します。アルファベット/ローカル言語/略称/表記順差を同一PIDに収束させ、検索精度を向上させます。

### 使用アルゴリズム

#### 2.1 Cosine Similarity

**役割**: 類似住所候補の高速検索

住所をベクトル空間に埋め込み、コサイン類似度で類似住所を検索します。

**技術詳細**:
```
ベクトル化手法:
1. TF-IDF: 住所構成要素の重要度を計算
2. Word2Vec/FastText: 単語埋め込み
3. BERT embeddings: コンテキストを考慮した埋め込み

コサイン類似度:
similarity(A, B) = (A · B) / (||A|| × ||B||)
```

**実装技術スタック**:
- **ベクトル化**: TF-IDF (scikit-learn), Word2Vec (gensim), BERT (transformers)
- **類似検索**: FAISS (Facebook AI Similarity Search), Annoy
- **次元削減**: PCA, t-SNE for visualization
- **インデックス**: HNSW (Hierarchical Navigable Small World)

**適用例**:
```python
from sentence_transformers import SentenceTransformer
import faiss

# 住所埋め込みモデル
model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')

# 住所リストをベクトル化
addresses = ["東京都渋谷区", "Tokyo Shibuya", "渋谷区東京都"]
embeddings = model.encode(addresses)

# FAISSインデックス構築
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

# 類似検索
query = "Shibuya Tokyo"
query_vector = model.encode([query])
distances, indices = index.search(query_vector, k=5)
```

**利点**:
- 多言語表記の類似性を検出
- 語順の違いを吸収
- 高速な類似検索（FAISS使用時）

---

#### 2.2 Locality-Sensitive Hashing (LSH)

**役割**: 揺れ表記も近傍検索可能に

LSHを使用することで、類似した住所を同じバケットにハッシュし、高速な近傍検索を実現します。

**技術詳細**:
```
LSHの基本原理:
- 類似したデータは同じハッシュ値を持つ確率が高い
- 複数のハッシュ関数を使用してバケットを作成
- 同一バケット内のデータは類似している可能性が高い

MinHash (文字列の場合):
h(S) = min{hash(x) | x ∈ S}
Jaccard類似度の近似として使用
```

**実装技術スタック**:
- **LSHライブラリ**: datasketch (Python), lsh (JavaScript)
- **ハッシュ関数**: MinHash, SimHash
- **ストレージ**: Redis (hash buckets), Elasticsearch
- **最適化**: Multi-probe LSH, Cross-polytope LSH

**適用例**:
```python
from datasketch import MinHash, MinHashLSH

# LSHインデックス構築
lsh = MinHashLSH(threshold=0.7, num_perm=128)

# 住所を追加
def add_address(address_id, address_text):
    m = MinHash(num_perm=128)
    for word in address_text.split():
        m.update(word.encode('utf8'))
    lsh.insert(address_id, m)

# 類似住所検索
def find_similar(query_text):
    m = MinHash(num_perm=128)
    for word in query_text.split():
        m.update(word.encode('utf8'))
    return lsh.query(m)

# 使用例
add_address("addr1", "東京都渋谷区神宮前")
add_address("addr2", "Tokyo Shibuya Jingumae")
add_address("addr3", "渋谷神宮前")

similar = find_similar("神宮前渋谷")
# → ["addr1", "addr3"] を返す
```

**利点**:
- 大規模データでも高速検索（O(1)に近い）
- 表記揺れに強い
- メモリ効率が良い

---

#### 2.3 N-gram

**役割**: 部分一致検索の強化

N-gramを使用することで、住所の部分文字列でも検索できるようになります。

**技術詳細**:
```
N-gramの種類:
- Character-level n-gram: "渋谷区" → ["渋谷", "谷区"] (2-gram)
- Word-level n-gram: "東京都 渋谷区" → ["東京都 渋谷区"] (2-gram)
- Mixed n-gram: 文字とワードの組み合わせ

Tri-gram例:
"Shibuya" → ["Shi", "hib", "ibu", "buy", "uya"]
```

**実装技術スタック**:
- **検索エンジン**: Elasticsearch (n-gram tokenizer), PostgreSQL (pg_trgm)
- **インデックス**: Inverted index with n-gram tokens
- **ファジーマッチ**: Levenshtein distance, Jaro-Winkler distance
- **最適化**: Bloom filter for pre-filtering

**適用例**:
```json
// Elasticsearchでのn-gram設定
{
  "settings": {
    "analysis": {
      "analyzer": {
        "address_ngram": {
          "tokenizer": "address_ngram_tokenizer"
        }
      },
      "tokenizer": {
        "address_ngram_tokenizer": {
          "type": "ngram",
          "min_gram": 2,
          "max_gram": 3,
          "token_chars": ["letter", "digit"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "address": {
        "type": "text",
        "analyzer": "address_ngram"
      }
    }
  }
}
```

```typescript
// TypeScriptでの検索実装
async function searchAddress(query: string): Promise<Address[]> {
  const result = await elasticsearchClient.search({
    index: 'addresses',
    body: {
      query: {
        match: {
          address: {
            query: query,
            fuzziness: 'AUTO',
            operator: 'and'
          }
        }
      }
    }
  });
  
  return result.hits.hits.map(hit => hit._source);
}

// 使用例
await searchAddress("渋谷"); // "渋谷区"、"渋谷駅" などがヒット
await searchAddress("Shibu"); // "Shibuya" がヒット
```

**利点**:
- 部分一致検索が可能
- タイポに強い（編集距離との併用）
- 多言語対応が容易

---

## 3. 履歴学習・優先抽出による検索UX高速化

### 概要

ユーザーが過去に使った住所パターン、サイトのタイプ、デフォルト住所の利用頻度をスコア化し学習することで、必要な候補だけを優先表示させます。

### 使用アルゴリズム

#### 3.1 Reinforcement Learning (強化学習)

**役割**: 住所候補の優先判断

強化学習を使用して、ユーザーの選択パターンから最適な住所推薦ポリシーを学習します。

**技術詳細**:
```
強化学習モデル:
- State (状態): ユーザーコンテキスト、サイトタイプ、時刻
- Action (行動): 住所候補の提示順序
- Reward (報酬): ユーザーが選択したか、チェックアウト完了したか
- Policy (方策): 最適な住所提示順序を決定

Q-Learning更新式:
Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]
```

**実装技術スタック**:
- **RLフレームワーク**: OpenAI Gym, Stable Baselines3, Ray RLlib
- **アルゴリズム**: DQN (Deep Q-Network), PPO (Proximal Policy Optimization)
- **ニューラルネット**: PyTorch, TensorFlow
- **環境**: カスタムGym環境（住所選択シミュレーション）

**適用例**:
```python
import gym
from stable_baselines3 import PPO

# カスタム環境定義
class AddressRecommendationEnv(gym.Env):
    def __init__(self):
        super().__init__()
        # State: [user_id, site_type, time_of_day, day_of_week]
        self.observation_space = gym.spaces.Box(
            low=0, high=1, shape=(10,), dtype=np.float32
        )
        # Action: 住所の提示順序（0-9の順列）
        self.action_space = gym.spaces.MultiDiscrete([10] * 10)
    
    def step(self, action):
        # ユーザーの選択をシミュレート
        selected_rank = self._user_selects(action)
        
        # 報酬計算
        # 1位を選択: +10, 2位: +5, 3位: +2, それ以外: -1
        reward = max(10 - selected_rank * 3, -1)
        
        # チェックアウト完了ボーナス
        if self._checkout_completed():
            reward += 20
        
        done = True
        return self._get_state(), reward, done, {}

# モデル学習
env = AddressRecommendationEnv()
model = PPO("MlpPolicy", env, verbose=1)
model.learn(total_timesteps=100000)

# 推論
obs = env.reset()
action, _states = model.predict(obs, deterministic=True)
```

**利点**:
- ユーザーの長期的な満足度を最大化
- 動的な環境変化に適応
- 探索と活用のバランス

---

#### 3.2 Ranking Algorithm

**役割**: 利用頻度・相性・サービス適合スコアで順位付け

複数の要素を組み合わせて、最適な住所ランキングを生成します。

**技術詳細**:
```
ランキングスコア計算:
Score(address, context) = 
  w1 × FrequencyScore +
  w2 × RecencyScore +
  w3 × CompatibilityScore +
  w4 × DefaultScore +
  w5 × DeliverabilityScore

各スコア計算例:
- FrequencyScore: log(1 + usage_count_30days)
- RecencyScore: exp(-days_since_last_use / 30)
- CompatibilityScore: site_category_match_rate
- DefaultScore: is_default ? 1.0 : 0.0
- DeliverabilityScore: can_deliver_to_region ? 1.0 : 0.0
```

**実装技術スタック**:
- **機械学習**: LambdaMART, RankNet, ListNet
- **学習**: XGBoost, LightGBM with ranking objective
- **特徴量**: User features, address features, context features
- **評価指標**: NDCG (Normalized Discounted Cumulative Gain), MRR (Mean Reciprocal Rank)

**適用例**:
```python
from lightgbm import LGBMRanker
import numpy as np

# 特徴量準備
def prepare_features(user, addresses, context):
    features = []
    for addr in addresses:
        feature_vector = [
            addr.usage_count_30days,
            days_since_last_use(addr),
            site_compatibility(addr, context.site_type),
            1.0 if addr.is_default else 0.0,
            1.0 if can_deliver(addr, context.site) else 0.0,
            addr.success_rate,
            time_match_score(addr, context.time),
        ]
        features.append(feature_vector)
    return np.array(features)

# ランキングモデル学習
model = LGBMRanker(
    objective='lambdarank',
    metric='ndcg',
    n_estimators=100
)

# 学習データ: (features, labels, groups)
# labels: 実際にユーザーが選択した順位
model.fit(X_train, y_train, group=group_train)

# 推論
def rank_addresses(user, addresses, context):
    features = prepare_features(user, addresses, context)
    scores = model.predict(features)
    
    # スコア順にソート
    ranked_indices = np.argsort(-scores)
    return [addresses[i] for i in ranked_indices]

# 使用例
ranked = rank_addresses(current_user, user_addresses, {
    'site_type': 'ec',
    'site': 'example-ec.com',
    'time': datetime.now()
})
```

**Learning to Rank (LTR) 手法**:

1. **Pointwise**: 各住所のスコアを個別に予測
2. **Pairwise**: 住所ペアの順序関係を学習（RankNet, LambdaMART）
3. **Listwise**: リスト全体の最適化（ListNet, AdaRank）

**利点**:
- 複数要素を統合的に考慮
- 継続的な改善が可能
- A/Bテストで効果測定しやすい

---

## 4. 不正・ノイズ除外による検索信頼性向上

### 概要

大量アクセス、不正住所照合試行、解除済サイトの除外などを監視AIでフィルタし、精度と信頼性を維持します。

### 使用アルゴリズム

#### 4.1 Anomaly Detection (異常検知)

**役割**: 異常なアクセスパターンの検知

正常な使用パターンから逸脱した異常な挙動を自動検出します。

**技術詳細**:

**教師なし異常検知手法**:

1. **Isolation Forest**:
   - ランダムにデータを分割
   - 異常値は早く孤立する性質を利用
   
2. **One-Class SVM**:
   - 正常データの境界を学習
   - 境界外のデータを異常と判定

3. **Autoencoder**:
   - 正常データの圧縮・復元を学習
   - 復元誤差が大きいデータを異常と判定

4. **LSTM-based Detection**:
   - 時系列パターンを学習
   - 予測と実測の差が大きい場合に異常

**実装技術スタック**:
- **機械学習**: scikit-learn (Isolation Forest, One-Class SVM)
- **ディープラーニング**: PyTorch/TensorFlow (Autoencoder, LSTM)
- **時系列分析**: Prophet, statsmodels
- **リアルタイム処理**: Apache Kafka, Apache Flink

**適用例**:
```python
from sklearn.ensemble import IsolationForest
import numpy as np

# 異常検知モデル
class AddressAccessAnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(
            contamination=0.01,  # 1%が異常と仮定
            random_state=42
        )
        
    def train(self, normal_access_logs):
        # 特徴量抽出
        features = self.extract_features(normal_access_logs)
        self.model.fit(features)
    
    def extract_features(self, logs):
        """アクセスログから特徴量を抽出"""
        features = []
        for log in logs:
            feature_vector = [
                log.requests_per_minute,
                log.unique_pids_accessed,
                log.failure_rate,
                log.geographic_diversity,
                log.time_variance,
                log.session_duration,
            ]
            features.append(feature_vector)
        return np.array(features)
    
    def detect_anomaly(self, access_log):
        """リアルタイム異常検知"""
        features = self.extract_features([access_log])
        prediction = self.model.predict(features)
        
        # -1: 異常, 1: 正常
        return prediction[0] == -1

# 使用例
detector = AddressAnomalyDetector()
detector.train(historical_normal_logs)

# リアルタイム検知
if detector.detect_anomaly(current_access):
    alert("Potential attack detected")
    apply_rate_limiting(user_id)
```

**LSTM-based Time Series Anomaly Detection**:
```python
import torch
import torch.nn as nn

class LSTMAnomalyDetector(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, input_size)
    
    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        predictions = self.fc(lstm_out)
        return predictions
    
    def detect_anomaly(self, sequence, threshold=0.1):
        """時系列データの異常検知"""
        with torch.no_grad():
            pred = self.forward(sequence)
            reconstruction_error = torch.mean((sequence - pred) ** 2, dim=-1)
            return reconstruction_error > threshold

# 使用例
model = LSTMAnomalyDetector(input_size=6, hidden_size=64, num_layers=2)
# モデル学習...

# 異常検知
access_sequence = get_recent_access_pattern(user_id, window=60)
is_anomaly = model.detect_anomaly(access_sequence)
```

**検知パターン**:

| 異常タイプ | 検知指標 | 閾値例 |
|----------|---------|-------|
| 大量リクエスト | requests_per_minute | > 100 |
| ブルートフォース | failure_rate | > 0.95 |
| 分散攻撃 | unique_ips | > 50 (5分間) |
| PID探索 | sequential_pid_access | > 1000 |
| 時間外アクセス | time_deviation | > 3σ |

**利点**:
- 既知・未知の攻撃を検知
- 正常パターンから自動学習
- リアルタイム検知が可能

---

#### 4.2 Rate Limiting (レート制御)

**役割**: 不正検索を制御

アクセス頻度を制限し、システムを保護します。

**技術詳細**:

**レート制限アルゴリズム**:

1. **Token Bucket**:
   - 一定速度でトークンを補充
   - リクエストごとにトークンを消費
   - トークンがない場合はリクエスト拒否

2. **Leaky Bucket**:
   - 固定速度でリクエストを処理
   - バッファが溢れたら拒否

3. **Sliding Window**:
   - 時間窓をスライドさせながらカウント
   - より正確なレート制限

4. **Adaptive Rate Limiting**:
   - ユーザーの信頼度スコアに応じて動的に調整

**実装技術スタック**:
- **インメモリストレージ**: Redis (counters, sorted sets)
- **API Gateway**: Kong, Nginx, AWS API Gateway
- **レート制限**: redis-cell (Token Bucket), Nginx limit_req
- **分散レート制限**: Redis Cluster, Hazelcast

**適用例**:
```typescript
import Redis from 'ioredis';

class RateLimiter {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis();
  }
  
  /**
   * Token Bucket アルゴリズム
   * @param key ユーザーID or IP
   * @param limit バケットサイズ
   * @param window 時間窓（秒）
   */
  async checkRateLimit(
    key: string,
    limit: number,
    window: number
  ): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const windowStart = now - window * 1000;
    
    // Luaスクリプトでアトミックに実行
    const script = `
      local key = KEYS[1]
      local window_start = ARGV[1]
      local now = ARGV[2]
      local limit = tonumber(ARGV[3])
      
      -- 古いエントリを削除
      redis.call('ZREMRANGEBYSCORE', key, 0, window_start)
      
      -- 現在のカウント取得
      local current = redis.call('ZCARD', key)
      
      if current < limit then
        -- リクエスト許可
        redis.call('ZADD', key, now, now)
        redis.call('EXPIRE', key, 60)
        return {1, limit - current - 1}
      else
        -- リクエスト拒否
        return {0, 0}
      end
    `;
    
    const result = await this.redis.eval(
      script,
      1,
      `ratelimit:${key}`,
      windowStart.toString(),
      now.toString(),
      limit.toString()
    ) as [number, number];
    
    return {
      allowed: result[0] === 1,
      remaining: result[1]
    };
  }
  
  /**
   * Adaptive Rate Limiting
   * 信頼度スコアに応じて制限を調整
   */
  async checkAdaptiveRateLimit(
    userId: string,
    trustScore: number
  ): Promise<boolean> {
    // 信頼度が高いほど多くのリクエストを許可
    const baseLimit = 100;
    const adjustedLimit = Math.floor(baseLimit * (1 + trustScore));
    
    const { allowed } = await this.checkRateLimit(
      userId,
      adjustedLimit,
      60 // 1分間
    );
    
    return allowed;
  }
}

// 使用例
const limiter = new RateLimiter();

// エンドポイント保護
app.use(async (req, res, next) => {
  const userId = req.user.id;
  const { allowed, remaining } = await limiter.checkRateLimit(
    userId,
    100, // 100リクエスト/分
    60
  );
  
  if (!allowed) {
    return res.status(429).json({
      error: 'Too Many Requests',
      retryAfter: 60
    });
  }
  
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  next();
});
```

**階層的レート制限**:
```typescript
// 複数レベルのレート制限
interface RateLimitTier {
  level: string;
  requests: number;
  window: number; // seconds
}

const rateLimitTiers: RateLimitTier[] = [
  { level: 'ip', requests: 1000, window: 3600 },      // IP: 1000/時間
  { level: 'user', requests: 100, window: 60 },       // User: 100/分
  { level: 'endpoint', requests: 10, window: 1 },     // Endpoint: 10/秒
];

async function checkAllTiers(
  ip: string,
  userId: string,
  endpoint: string
): Promise<boolean> {
  for (const tier of rateLimitTiers) {
    const key = tier.level === 'ip' ? ip : 
                tier.level === 'user' ? userId : 
                endpoint;
    
    const { allowed } = await limiter.checkRateLimit(
      `${tier.level}:${key}`,
      tier.requests,
      tier.window
    );
    
    if (!allowed) {
      logRateLimitViolation(tier.level, key);
      return false;
    }
  }
  
  return true;
}
```

**利点**:
- システム保護
- DDoS攻撃の防御
- リソースの公平な分配
- ユーザーごとのカスタマイズ可能

---

## 技術スタックまとめ / Technology Stack Summary

### 住所意味理解 (Address Semantic Understanding)

| アルゴリズム | 主要技術 | 用途 |
|------------|---------|------|
| PCFG | NLTK, spaCy, CYK algorithm | 文法パース、表記揺れ吸収 |
| AST | Tree data structures, DFS/BFS | 階層検索、部分一致 |
| DAG | Neo4j, ArangoDB, Cypher | 複雑な地域関係、経路検索 |
| Merkle Tree | SHA-256, BLAKE2, Binary tree | 一致検証、改ざん検知 |

### 類似住所・揺れ吸収 (Similarity & Variation Absorption)

| アルゴリズム | 主要技術 | 用途 |
|------------|---------|------|
| Cosine Similarity | TF-IDF, Word2Vec, BERT, FAISS | 類似検索、多言語対応 |
| LSH | MinHash, SimHash, datasketch | 高速近傍検索、表記揺れ |
| N-gram | Elasticsearch, pg_trgm | 部分一致、ファジー検索 |

### 履歴学習・優先抽出 (Learning & Prioritization)

| アルゴリズム | 主要技術 | 用途 |
|------------|---------|------|
| Reinforcement Learning | PPO, DQN, Stable Baselines3 | 最適化方策学習、適応的推薦 |
| Ranking | LambdaMART, LightGBM, XGBoost | スコアリング、順位付け |

### 不正・ノイズ除外 (Fraud & Noise Filtering)

| アルゴリズム | 主要技術 | 用途 |
|------------|---------|------|
| Anomaly Detection | Isolation Forest, LSTM, Autoencoder | 異常パターン検知 |
| Rate Limiting | Redis, Token Bucket, Sliding Window | アクセス制御、DoS防御 |

---

## 実装ロードマップ / Implementation Roadmap

### Phase 1: 基盤構築（3ヶ月）

**住所意味理解の実装**:
- [ ] PCFG文法定義と学習データ準備
- [ ] AST構造の設計とインデックス構築
- [ ] DAG (Neo4j) 環境構築
- [ ] Merkle Tree 実装とPID統合

**成果物**:
- 住所パーサー（PCFG-based）
- 階層検索エンジン（AST/DAG）
- 住所検証システム（Merkle Tree）

### Phase 2: 類似検索の実装（2ヶ月）

**類似住所・揺れ吸収の実装**:
- [ ] 多言語埋め込みモデルの学習
- [ ] FAISS インデックス構築
- [ ] LSH (MinHash) 実装
- [ ] Elasticsearch n-gram設定

**成果物**:
- 類似住所検索API
- 多言語対応検索エンジン
- ファジーマッチングシステム

### Phase 3: 学習・ランキングの実装（3ヶ月）

**履歴学習・優先抽出の実装**:
- [ ] 強化学習環境構築
- [ ] PPOモデルの学習
- [ ] LambdaMART ランキングモデル
- [ ] A/Bテスト基盤

**成果物**:
- 住所推薦システム
- コンテキスト別ランキング
- 継続学習パイプライン

### Phase 4: セキュリティ強化（2ヶ月）

**不正・ノイズ除外の実装**:
- [ ] Isolation Forest 異常検知
- [ ] LSTM 時系列異常検知
- [ ] Redis レート制限
- [ ] リアルタイム監視ダッシュボード

**成果物**:
- 異常検知システム
- レート制限API
- セキュリティモニタリング

### Phase 5: 統合・最適化（2ヶ月）

**全システム統合**:
- [ ] 各コンポーネントの統合
- [ ] パフォーマンスチューニング
- [ ] 負荷テスト
- [ ] ドキュメント整備

**成果物**:
- 統合検索エンジン API
- 運用ガイド
- パフォーマンスレポート

---

## まとめ / Summary

### 検索エンジン向上の主軸アルゴリズム

1. **住所の文法学習・構造解析**
   - PCFG: 文法揺れ対応
   - AST: 階層的検索
   - DAG: 複雑な地域関係

2. **住所の一致・包含検証**
   - Merkle Tree: 高速照合と改ざん検知

3. **住所の近傍・類似検索**
   - LSH: 高速近傍検索
   - Cosine Similarity: 意味的類似度
   - N-gram: 部分一致・ファジー検索

4. **住所候補の優先順位抽出**
   - Reinforcement Learning: 適応的最適化
   - Ranking: 多要素スコアリング

5. **ノイズ・不正除外**
   - Anomaly Detection: 異常パターン検知
   - Rate Limiting: アクセス制御

### システムの実現価値

これらのAI・アルゴリズムを組み合わせることで、以下が実現します:

✅ **住所入力なしで検索だけでチェックアウト/予約成立**
- フォーム入力 → 検索選択へ
- 5-10ステップ → 1-2ステップへ短縮

✅ **検索能力の向上**
- 多言語・表記揺れに対応
- 文脈に応じた最適提案
- リアルタイム学習・改善

✅ **信頼性の確保**
- 不正アクセスの自動検知
- システム保護とスケーラビリティ
- ユーザープライバシーの保護

---

## 関連ドキュメント / Related Documentation

- [AI機能強化戦略](./ai-capabilities.md) - 5つのAI機能詳細
- [住所検索エンジン](../address-search-engine.md) - 検索エンジンアーキテクチャ
- [送り状AI・アルゴリズム](./waybill-ai-capabilities.md) - 配送最適化
- [Cloud Address Book](../cloud-address-book.md) - システム全体像

---

**🚀 住所クラウド検索エンジン - AIアルゴリズムで住所検索を革新する**
