const axios = require('axios');
const { JSDOM } = require('jsdom');
const fs = require('fs');

axios.defaults.baseURL = 'http://www.mca.gov.cn';

const results = [];
const indexMap = {};


const push = (data) => {
  const { value } = data;
  const dept1 = Math.floor(value / 1e4) * 1e4;
  const dept2 = Math.floor(value / 100) * 100;

  const rootIndex = indexMap[dept1];
  let parentIndex = indexMap[dept2];

  if (value % 1e4 === 0) {
    indexMap[value] = results.length;
    results.push(data);
  } else {
    if (value % 100 === 0) {
      indexMap[value] = results[rootIndex].children.length;
      results[rootIndex].children.push(data);
    } else {
      if (typeof parentIndex === 'undefined') {
        parentIndex = indexMap[dept2] = 0;
        results[rootIndex].children.push({
          ...results[rootIndex],
          children: [],
        });
      }
      results[rootIndex].children[parentIndex].children.push(data);
    }
  }
};

const main = async () => {
  const { data: listPageText } = await axios.get(`/article/sj/xzqh/${new Date().getFullYear()}/`);
  const matchLatestHref = listPageText.match(
    /(?<=class="artitlelist")[^<>]*href="(?<href>[^"]+)[^>]+>[^<]+行政区划代码\s*<\/a>/);
  if (!matchLatestHref) {
    console.log('匹配不到最新页面');
    return;
  }

  let href = matchLatestHref.groups.href;
  let { data: html } = await axios.get(href);
  const redirect = html.match(/window.location.href\s*=\s*["'](?<href>[^"']*)["']/);
  if (redirect) {
    href = redirect.groups.href;
    html = (await axios.get(redirect.groups.href)).data;
  }

  console.log(href);

  const dom = new JSDOM(html);
  const $ = (require('jquery'))(dom.window);

  const $rows = $('tr');

  const test = /^\d{6}/;
  for (let i = 0; i < $rows.length; i++) {
    const $row = $rows[i];
    const text = $($row).text().replace(/\s/g, '');
    if (!test.test(text)) continue;

    const value = parseInt(text.substr(0, 6));
    const label = text.substr(6);
    const data = { value, label, children: [] };

    push(data);
  }

  fs.writeFileSync('./src/utils/area.json', JSON.stringify(results, null, 2));
};

main();

