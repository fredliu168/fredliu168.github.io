# 发布站点
hexo clean 
hexo d -g
# 备份到git
git add -A
git commit -m "--"
git push origin hexo