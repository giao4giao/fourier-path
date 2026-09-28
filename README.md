# 傅里叶之路

一个面向初学者的中文傅里叶变换交互学习网站。从波形、频率和相位开始，逐步学习复数、傅里叶级数、傅里叶变换、DFT/FFT、采样、混叠、窗函数与工程应用。

## 功能

- 8 阶段渐进式学习路线
- 双频信号、相位、复平面、方波合成、混叠、窗函数等交互实验
- 直觉解释、数学公式与工程含义分层呈现
- 每阶段的符号解释、图形读法、操作步骤、带数值算例、自测题与即时反馈
- 音频、设备振动、变频信号三个完整分析案例与常见误区
- 毕业挑战、公式速查表
- 学习进度保存在浏览器 `localStorage`
- 纯静态网站，无数据库、无账号系统、无后端依赖

## 目录

```text
dist/                 网站文件，可直接部署
  index.html
  styles.css
  app.js
docker/
  nginx.conf          Nginx 静态站点配置
tests/                核心计算与进度读取的回归测试
Dockerfile
docker-compose.yml
wrangler.jsonc        Cloudflare Workers 静态资源配置
```

## 本地预览

直接打开 `dist/index.html`，或运行：

```bash
python3 -m http.server 8080 --directory dist
```

然后访问 `http://localhost:8080`。

运行计算与进度读取的回归测试：

```bash
npm test
```

## Cloudflare Pages 部署

在 Cloudflare 控制台中选择 **Workers & Pages → Create → Pages → Connect to Git**，连接本仓库，并设置：

- Production branch：`main`
- Framework preset：`None`
- Build command：`exit 0`
- Build output directory：`dist`

保存后，每次推送到 `main` 都会自动发布。之后可在项目的 **Custom domains** 中绑定自己的域名。

也可以命令行直接上传：

```bash
npm run deploy:pages
```

第一次执行时，Wrangler 会引导登录 Cloudflare 并创建或选择 Pages 项目。

## Cloudflare Workers 部署

仓库已经包含 `wrangler.jsonc`，Workers 会把 `dist` 作为静态资源目录：

```bash
npm run deploy:workers
```

本地使用 Workers 环境预览：

```bash
npm run dev
```

部署成功后，可在 Worker 的 **Settings → Domains & Routes** 中绑定自己的域名。

## Docker 一键部署

```bash
docker compose up -d --build
```

默认访问 `http://服务器IP:8080`。修改端口：

```bash
PORT=3000 docker compose up -d --build
```

如果服务器已有 Nginx Proxy Manager，可将反向代理目标设置为：

- Forward Hostname/IP：运行 Docker 的服务器地址；同一 Docker 网络时可使用服务名 `fourier-path`
- Forward Port：`8080`（同一 Docker 网络直连容器时使用 `80`）
- Scheme：`http`

更新网站：

```bash
git pull
docker compose up -d --build
```

停止并删除容器：

```bash
docker compose down
```

## 技术说明

项目使用原生 HTML、CSS、JavaScript 和 Canvas，不依赖前端框架。Cloudflare Pages、Workers 静态资源和 Docker/Nginx 三种部署方式呈现的是同一份 `dist` 内容。

## License

[MIT](LICENSE)
