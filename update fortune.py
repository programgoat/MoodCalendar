import requests
import os
import json

def get_ai_fortune():
    # 日本語性能が高いモデル（GoogleのGemmaなど）を指定
    API_URL = "https://api-inference.huggingface.co"
    headers = {"Authorization": f"Bearer {os.getenv('HF_TOKEN')}"}
    
    prompt = """
あなたは、世界で一番美しく、かつ鋭い的中率を誇る占星術師です。
今日（その日）の12星座占いを生成してください。

【出力ルール】
1. 形式は必ずJSONのみ：{"星座名": {"rank": 順位, "text": "占い文", "lucky": "アイテム"}}
2. 順位（rank）が下位（10位〜12位）の星座ほど、以下のことを徹底してください：
   - 決して突き放さず、寄り添うような優しい口調にすること。
   - 「今日はデトックスに最適」「今は力を蓄える時期」など、ポジティブな言い換えをすること。
   - 最後に必ず「大丈夫、明日はもっと良くなるよ」というニュアンスの励ましを入れること。
3. 専門用語（例：ハウス、逆行、アスペクトなど）を1つ混ぜて、バーナム効果を活かした「本格的」な文章にすること。
"""
    
    response = requests.post(API_URL, headers=headers, json={"inputs": prompt, "parameters": {"return_full_text": False}})
    
    if response.status_code == 200:
        # AIの回答からJSON部分だけを抽出して保存
        res_text = response.json()[0]['generated_text']
        return res_text
    return None

fortune_json = get_ai_fortune()
if fortune_json:
    # サイトが読み込むためのファイル「fortune.json」として保存
    with open("fortune.json", "w", encoding="utf-8") as f:
        f.write(fortune_json)
