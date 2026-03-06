#!/bin/bash

echo "========================================="
echo "🧪 PRUEBA RÁPIDA DEL SISTEMA"
echo "========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para pruebas
test_endpoint() {
  local method=$1
  local url=$2
  local data=$3
  local token=$4
  local description=$5

  echo -e "${YELLOW}📝 Prueba: $description${NC}"

  if [ -z "$token" ]; then
    curl -s -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$url"
  else
    curl -s -X "$method" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$data" \
      "$url"
  fi

  echo ""
  echo ""
}

# 1. Verificar que el servidor esté activo
echo -e "${YELLOW}1️⃣ Verificando servidor${NC}"
HEALTH=$(curl -s http://localhost:3000/health)
echo "Respuesta: $HEALTH"
echo ""

# 2. Probar login
echo -e "${YELLOW}2️⃣ Probando login con admin@heladeria.com${NC}"
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@heladeria.com","password":"admin123"}' \
  http://localhost:3000/api/login)

echo "Respuesta: $LOGIN_RESPONSE"

# Extraer token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✅ Token obtenido: ${TOKEN:0:20}...${NC}"
echo ""

# 3. Verificar que sea accesible desde React
echo -e "${YELLOW}3️⃣ Verificando CORS (debe permitir localhost:3000)${NC}"
CORS_CHECK=$(curl -s -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  http://localhost:3000/api/login -w "\n%{http_code}")

HTTP_CODE=$(echo "$CORS_CHECK" | tail -n1)
echo "HTTP Status: $HTTP_CODE"
echo ""

echo -e "${GREEN}✅ Pruebas completadas${NC}"
echo ""
echo "Instrucciones para continuar:"
echo "1. Inicia el servidor: npm run dev (en carpeta backend)"
echo "2. Inicia React: npm start (en carpeta frontend)"
echo "3. Ve a http://localhost:3000 en tu navegador"
