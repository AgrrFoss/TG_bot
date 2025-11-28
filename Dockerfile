# Используем базовый образ Node.js с Yarn
FROM node:22-alpine AS builder

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и yarn.lock
COPY package.json yarn.lock ./

# Устанавливаем зависимости с использованием Yarn
RUN yarn install --frozen-lockfile
RUN yarn global add @nestjs/cli
# Копируем исходный код приложения
COPY . .

# Собираем приложение для продакшена
RUN yarn run build

# Используем облегченный образ Node.js для запуска приложения
FROM node:22-alpine AS runner

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем только необходимые файлы из предыдущего этапа (builder)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

# Устанавливаем только production зависимости (необязательно, но рекомендуется для уменьшения размера образа)
RUN yarn install --production --frozen-lockfile

# Указываем порт, который приложение слушает
EXPOSE 3000

# Запускаем приложение Nest.js
CMD ["node", "dist/main.js"]