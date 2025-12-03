#!/bin/bash
# Script para corrigir imports @ para caminhos relativos

echo "🔧 Corrigindo imports @ para caminhos relativos..."

# Para arquivos nas rotas (routes/*)
find ./routes -name "*.ts" -exec sed -i 's|@/controllers/|../controllers/|g' {} \;
find ./routes -name "*.ts" -exec sed -i 's|@/middlewares/|../middlewares/|g' {} \;
find ./routes -name "*.ts" -exec sed -i 's|@/models/|../models/|g' {} \;
find ./routes -name "*.ts" -exec sed -i 's|@/types|../types|g' {} \;
find ./routes -name "*.ts" -exec sed -i 's|@/services/|../services/|g' {} \;

# Para arquivos nos controllers (controllers/*)
find ./controllers -name "*.ts" -exec sed -i 's|@/services/|../services/|g' {} \;
find ./controllers -name "*.ts" -exec sed -i 's|@/middlewares/|../middlewares/|g' {} \;
find ./controllers -name "*.ts" -exec sed -i 's|@/models/|../models/|g' {} \;
find ./controllers -name "*.ts" -exec sed -i 's|@/types|../types|g' {} \;
find ./controllers -name "*.ts" -exec sed -i 's|@/config/|../config/|g' {} \;

# Para arquivos nos services (services/*)
find ./services -name "*.ts" -exec sed -i 's|@/models/|../models/|g' {} \;
find ./services -name "*.ts" -exec sed -i 's|@/middlewares/|../middlewares/|g' {} \;
find ./services -name "*.ts" -exec sed -i 's|@/types|../types|g' {} \;
find ./services -name "*.ts" -exec sed -i 's|@/config/|../config/|g' {} \;
find ./services -name "*.ts" -exec sed -i 's|@/utils/|../utils/|g' {} \;

# Para arquivos nos middlewares (middlewares/*)
find ./middlewares -name "*.ts" -exec sed -i 's|@/types|../types|g' {} \;
find ./middlewares -name "*.ts" -exec sed -i 's|@/config/|../config/|g' {} \;
find ./middlewares -name "*.ts" -exec sed -i 's|@/models/|../models/|g' {} \;
find ./middlewares -name "*.ts" -exec sed -i 's|@/lib/|../lib/|g' {} \;

# Para arquivos nos models (models/*)
find ./models -name "*.ts" -exec sed -i 's|@/types|../types|g' {} \;
find ./models -name "*.ts" -exec sed -i 's|@/utils/|../utils/|g' {} \;

# Para server.ts
sed -i 's|@/config/|./config/|g' ./server.ts
sed -i 's|@/middlewares/|./middlewares/|g' ./server.ts

echo "✅ Imports corrigidos!"