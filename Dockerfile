# 使用轻量级 Node 环境
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 利用 Docker 缓存：先复制 package.json 安装依赖
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && npm install

# 复制源码并构建
COPY . .
RUN npm run build

# 暴露 Nest.js 默认端口
EXPOSE 3005

# 运行生产模式
CMD ["npm", "run", "start:prod"]