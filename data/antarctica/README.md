antarctica/
  AQ.yaml                              # 南極大陸全体 (ISO 3166-1 alpha-2: AQ)
                                       # → 基本メタ情報、南極条約ルールを記載

  claims/                              # 領有権主張地域（南極条約で凍結中、参考情報）
    AT.yaml                            # オーストラリア南極領土 (Australian Antarctic Territory)
    BAT.yaml                           # 英国南極領土 (British Antarctic Territory)
    FR_ADELIE.yaml                     # フランス領アデリーランド (Adélie Land)
    NZ_ROSS.yaml                       # ニュージーランド ロス海地域 (Ross Dependency)
    NO_QML.yaml                        # ノルウェー クイーン・モード・ランド (Queen Maud Land)
    NO_PB.yaml                         # ノルウェー ピーター1世島 (Peter I Island)
    CL_CLAIM.yaml                      # チリ領主張地域
    AR_CLAIM.yaml                      # アルゼンチン領主張地域
    UNCLAIMED.yaml                     # 無主地帯（マリー・バードランド）

  stations/                            # 実務上の住所は基地宛て郵便
    schema.yaml                        # 共通スキーマ定義
                                       # （基地名・国・運営機関・座標・補給港・郵便経路など）
    JP_SYOWA.yaml                      # 日本：昭和基地（NIPR管轄）
    US_MCMURDO.yaml                    # 米国：マクマード基地（南極最大）
    CN_ZHONGSHAN.yaml                  # 中国：中山基地
    RU_VOSTOK.yaml                     # ロシア：ボストーク基地
    DE_NEUMAYER.yaml                   # ドイツ：ノイマイヤー基地
    AU_CASEY.yaml                      # オーストラリア：ケーシー基地
    AU_DAVIS.yaml                      # オーストラリア：デービス基地
    AU_MAWSON.yaml                     # オーストラリア：モーソン基地
    IN_MAITRI.yaml                     # インド：マイトリ基地
    IN_BHARATI.yaml                    # インド：バラティ基地
    KR_SEJONG.yaml                     # 韓国：セジョン基地
    IT_ZUCCHELLI.yaml                  # イタリア：マリオ・ズッケリ基地
    # 他国の小規模基地は必要に応じ追加

  meta.yaml                            # 南極特有ルールを記載：
                                       # - 郵便番号制度なし
                                       # - 国境なし
                                       # - 各国の本土郵便局を経由
                                       # - 実務住所は「宛名＋基地名＋国＋経由地」

  README.md                            # 南極条約の概要、claims/とstations/の関係、
                                       # 郵便運用の流れ（例：国本土郵便局 → 南極基地）
