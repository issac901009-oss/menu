module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = 'issac901009-oss';
  const repo = 'menu';
  const path = 'data.json';
  const API = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'menu-app',
    'Content-Type': 'application/json'
  };

  try {
    if (req.method === 'GET') {
      const resp = await fetch(API, { headers });
      if (resp.status === 404) {
        return res.status(200).json({ dishes: [], savedMeals: [], nextId: 1 });
      }
      if (!resp.ok) return res.status(500).json({ error: '读取失败' });
      const json = await resp.json();
      return res.status(200).json(JSON.parse(Buffer.from(json.content, 'base64').toString()));
    }

    if (req.method === 'POST') {
      const cur = await fetch(API, { headers });
      let sha = null;
      if (cur.ok) sha = (await cur.json()).sha;
      const content = Buffer.from(JSON.stringify(req.body)).toString('base64');
      const put = await fetch(API, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ message: '更新菜单', content, sha })
      });
      if (!put.ok) return res.status(500).json({ error: '保存失败' });
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
