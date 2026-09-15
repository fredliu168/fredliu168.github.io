# 发布站点
set -e
./node_modules/.bin/hexo clean
./node_modules/.bin/hexo d -g
# 备份到 git
git add -A
git diff --cached --quiet || git commit -m "--"
git push origin hexo
