# Используем базовый образ Node.js с Yarn
FROM node:22-alpine AS builder

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и yarn.lock
COPY package.json yarn.lock ./

# Устанавливаем зависимости с использованием Yarn
RUN yarn install --frozen-lockfile

# --- НОВЫЕ ШАГИ ДЛЯ БОЛЕЕ ГЛУБОКОЙ ОТЛАДКИ ---
# 1. Посмотреть, что вообще есть в node_modules/.bin/
RUN echo "--- Listing node_modules/.bin/ ---" && ls -la node_modules/.bin/ || echo "node_modules/.bin/ is empty or missing"
# 2. Посмотреть, куда установился сам пакет @nestjs/cli
RUN echo "--- Listing node_modules/@nestjs/cli/ ---" && ls -la node_modules/@nestjs/cli/
# 3. Посмотреть, есть ли внутри @nestjs/cli папка bin и ее содержимое
RUN echo "--- Listing node_modules/@nestjs/cli/bin/ ---" && ls -la node_modules/@nestjs/cli/bin/
# 4. Поискать файл "nest" во всем node_modules на всякий случай
RUN echo "--- Searching for 'nest' executable in node_modules ---" && find node_modules -name "nest" -type f -o -name "nest.js" -type f
# 5. Проверить версию Yarn, хотя она уже видна (v1.22.22)
RUN echo "--- Yarn version ---" && yarn --version
# --- КОНЕЦ ШАГОВ ОТЛАДКИ ---


# Копируем исходный код приложения
COPY . .

# Собираем приложение для продакшена
RUN yarn build

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