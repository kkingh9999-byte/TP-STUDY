const drugGameData = [
    {
        category: "氣道處置",
        question: "成人氣管內管插管的適應症為何？",
        answer: "1. 心肺功能停止，或停止呼吸。\n2. 意識不清，無法保護呼吸道暢通，且血氧濃度經過 BVM 後仍未達 85%，且有休克症狀或瀕死呼吸者。\n3. 上呼吸道阻塞。\n4. 為連接侵入型機械通氣(須線上醫療指導)。",
        hint: "包含四大類適應症 (心肺/呼吸、意識血氧休克、上呼吸道阻塞、機械通氣)"
    },
    {
        category: "氣道處置",
        question: "聲門上呼吸道裝置 (SGA) 的適用時機？",
        answer: "適用於昏迷的傷病患，且需要甦醒球人工呼吸，並符合：\n1. BVM 人工呼吸無法改善缺氧狀況時。\n2. BVM 人工呼吸操作不易或困難時。\n3. 頸椎傷患無法持續用下顎推舉法維持暢通的呼吸道時。\n4. 需要較長時間（≧ 10 分鐘）轉送至急救責任醫院時。",
        hint: "昏迷需要BVM但BVM有困難、無法維持暢通，或需長時間轉送"
    },
    {
        category: "創傷與休克處置",
        question: "壓砸傷的給藥處置為何？",
        answer: "藥物：NaHCO3\n用法：將 4 支 NaHCO3 針劑 (約 70mEq) 加入 N/S 500 ml 滴注。\n(僅可以給予一次為限)",
        hint: "鹼化血液的藥物與劑量"
    },
    {
        category: "創傷與休克處置",
        question: "創傷性休克使用 Transamine 的 3 個適應症？",
        answer: "需同時符合：\n1. 無法經由加壓止血之外傷出血性休克。\n2. 收縮壓 < 90 mmHg 或心跳 > 120。\n3. 外傷發生 3 小時以內。",
        hint: "止血方式、生命徵象標準、受傷時間"
    },
    {
        category: "創傷與休克處置",
        question: "創傷性休克使用 Transamine 的劑量與用法？",
        answer: "抽取 1000 mg 加入 N/S 100 ml，滴注時間約 10 分鐘。",
        hint: "總量為多少？加入多少 N/S？滴多久？"
    },
    {
        category: "創傷與休克處置",
        question: "成人外傷止痛 Tramadol 的適應症與禁忌症？",
        answer: "【適應症】無禁忌症之 18 歲以上成人，急性外傷疼痛指數 VAS ≧ 4 分。\n【禁忌症】\n1. 對 Tramadol 或鴉片類藥物過敏\n2. 意識不清\n3. 腦部損傷",
        hint: "年齡限制與 VAS 幾分？三大禁忌？"
    },
    {
        category: "創傷與休克處置",
        question: "成人外傷止痛 Tramadol 的劑量與用法？",
        answer: "劑量：50-100 mg IV/IM。\n注射後 15 分鐘後無法緩解疼痛，到院前可再重複 1 次劑量。",
        hint: "注射途徑？多少劑量？幾分鐘後可重複？"
    },
    {
        category: "內科急症處置",
        question: "缺血性胸痛給予 NTG 的劑量與注意事項？",
        answer: "用法：每 5 分鐘建議服用 1 次，到院前最多 3 次。\n注意事項：\n1. 收縮壓需 ≧ 90 mmHg\n2. 脈搏 < 50 或 > 100 次/分時應小心使用\n3. 48 小時內使用過壯陽藥物者不可服用",
        hint: "間隔時間？最多幾次？生命徵象限制與藥物禁忌？"
    },
    {
        category: "內科急症處置",
        question: "缺血性胸痛給予 Aspirin 的劑量與禁忌症？",
        answer: "劑量：口服 300 mg。\n禁忌症：過敏、活動性潰瘍、出血傾向或經口進食困難之病人不建議使用。",
        hint: "劑量多少？四大禁忌症？"
    },
    {
        category: "內科急症處置",
        question: "低血糖的給藥標準與 D50W 劑量？",
        answer: "標準：血糖低於 50 mg/dl 或顯示 Low。\n劑量：\n- 若已給予 D10W，可給予 D50W 1 Amp 再觀察。\n- 若未給予 D10W，可給予 D50W 1-4 Amps。",
        hint: "血糖低於多少？有/無給予D10W時的劑量差異？"
    },
    {
        category: "內科急症處置",
        question: "癲癇重積的定義與 Midazolam 劑量？",
        answer: "定義：連續抽搐超過 5 分鐘，或在 5 分鐘內有 2 次發作且意識未能恢復。\n用法 (限18歲且無過敏)：\n成人與青少年 5 mg IM 或 IV 緩推 2 分鐘。\n若 3-5 分鐘後仍有抽搐，可重複 1 次，最高總量為 10 mg。",
        hint: "重積狀態時間定義？第一劑多少？最高總量？"
    },
    {
        category: "內科急症處置",
        question: "呼吸困難給予氣霧治療的藥物與氧氣流量設定？",
        answer: "藥物可包含抗膽鹼藥物(Atrovent)與 β2 促進劑混合。\n設定：置入小型噴霧器，氧氣流量設定 6 L/min 霧化吸入。\n(< 2 歲病人使用 N/S 稀釋至總量 2 ml)",
        hint: "氧氣流量開多少 L/min？小兒如何稀釋？"
    },
    {
        category: "內科急症處置",
        question: "過敏性休克 Epinephrine 的劑量與途徑？",
        answer: "嚴重過敏：1:1000 濃度 0.3-0.5 mg IM/SC，每 15-20 分鐘 1 次，最多 3 次。\n不穩定病人(休克)：成人 0.3-0.5 mg IM；小兒 0.01 mg/kg IM。每 5-10 分鐘可重複。\n禁忌注意：年齡 < 45 歲以下，無心臟疾病或心跳 < 120 次/min時才可使用(嚴重過敏時)。",
        hint: "濃度多少？成人與小兒劑量？給藥途徑？"
    },
    {
        category: "心血管急症 (ACLS)",
        question: "心臟停止 (Cardiac Arrest) 的 Epinephrine 劑量？",
        answer: "1 mg IV push，每 3-5 分鐘重複一次。",
        hint: "劑量與重複時間間隔？"
    },
    {
        category: "心血管急症 (ACLS)",
        question: "心臟停止 (Cardiac Arrest) 的 Amiodarone 劑量？",
        answer: "第一劑：300 mg IVP\n第二劑：150 mg IVP",
        hint: "第一劑與第二劑的劑量？"
    },
    {
        category: "心血管急症 (ACLS)",
        question: "心臟停止 (Cardiac Arrest) 的 Lidocaine 劑量？",
        answer: "第一劑：1-1.5 mg/kg IVP\n第二劑：0.5-0.75 mg/kg IVP",
        hint: "第一劑與第二劑的劑量範圍？"
    },
    {
        category: "心血管急症 (ACLS)",
        question: "復甦後照護的 Dirty Epinephrine Drip 配法與流速？",
        answer: "配法：將 1 支 Epinephrine (1mg) 加入 N/S 500 ml (= 2mcg/ml)。\n流速：調整點滴數從每秒 1 滴開始 (約 6 mcg/min 或 0.1mcg/kg/min @ 60kg)。",
        hint: "幾支加入多少水？初始流速為何？"
    },
    {
        category: "心血管急症 (ACLS)",
        question: "心搏過緩 (Bradycardia) 的 Atropine 劑量與禁忌？",
        answer: "劑量：1 mg IVP，每 3-5 分鐘重複一次，最大劑量 3 mg。\n禁忌：STEMI 病人不可給予 Atropine。",
        hint: "單次劑量？最大劑量？哪種病人禁用？"
    },
    {
        category: "心血管急症 (ACLS)",
        question: "心搏過速 (Tachycardia) 的 Adenosine 劑量？",
        answer: "第一劑：6 mg 快速 IVP，接著以生理食鹽水沖洗管路。\n第二劑：視需要給予 12 mg。",
        hint: "第一劑與第二劑劑量？給藥技巧？"
    },
    {
        category: "心血管急症 (ACLS)",
        question: "心搏過速 (Tachycardia) 的 Amiodarone 劑量？",
        answer: "第一劑：150 mg IVD，給予 10 分鐘。\n(若心室心搏過速復發視需要重複。之後前 6 小時以每分鐘 1 mg 速率維持)",
        hint: "單次劑量多少？給幾分鐘？"
    }
];
