# 发布站点
set -e

if ! command -v node >/dev/null 2>&1; then
  for node_dir in \
    "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin" \
    "/opt/homebrew/bin" \
    "/usr/local/bin"; do
    if [ -x "$node_dir/node" ]; then
      export PATH="$node_dir:$PATH"
      break
    fi
  done
fi

./node_modules/.bin/hexo clean
./node_modules/.bin/hexo generate
# 给本地 css/js/图片加上内容哈希（?v=xxxx），避免改过样式后访问者仍命中旧缓存
node tools/cache-bust.mjs
./node_modules/.bin/hexo deploy
# 备份到 git
git add -A
git diff --cached --quiet || git commit -m "--"
git push origin hexo
