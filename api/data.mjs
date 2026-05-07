const OWNER = 'issac901009-oss';
const REPO = 'menu';
const FILE_PATH = 'data.json';
const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'menu-app'
  };

  try {
    if (req.method === 'GET') {
      const resp = await fetch(API_URL, { headers });
      if (resp.status === 404) {
        return res.status(200).json({ dishes: [], savedMeals: [], nextId: 1 });
      }
      if (!resp.ok) {
        return res.status(500).json({ error: '读取失败' });
      }
      const json = await resp.json();
      const content = JSON.parse(Buffer.from(json.content, 'base64').toString());
      return res.status(200).json(content);
    }

    if (req.method === 'POST') {
      const currentResp = await fetch(API_URL, { headers });
      let sha = null;
      if (currentResp.ok) {
        sha = (await currentResp.json()).sha;
      }
      const body = JSON.stringify(req.body);
      const base64 = Buffer.from(body).toString('base64');
      const putResp = await fetch(API_URL, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '更新菜单数据',
          content: base64,
          sha: sha
        })
      });
      if (!putResp.ok) {
        const errText = await putResp.text();
        return res.status(500).json({ error: '保存失败', detail: errText });
      }
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
