
#!/bin/bash
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Caminhos
ROOT_DIR="$(pwd)"
ANDROID_DIR="$ROOT_DIR/android"
APP_DIR="$ANDROID_DIR/app"
KEYSTORE="$APP_DIR/hobbybichos-release-key.keystore"
GRADLE_PROPS="$ANDROID_DIR/gradle.properties"
GRADLE_PROPS_EXAMPLE="$ANDROID_DIR/gradle.properties.example"
XML_DIR="$APP_DIR/src/main/res/xml"
NETWORK_CONFIG="$XML_DIR/network_security_config.xml"

print_step() {
	echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} ${GREEN}$1${NC}"
}
print_warning() {
	echo -e "${YELLOW}⚠️  $1${NC}"
}
print_error() {
	echo -e "${RED}❌ $1${NC}"
}
print_success() {
	echo -e "${GREEN}✅ $1${NC}"
}

echo "================================================="
echo "Iniciando o processo de prebuild e build para Android"
echo "================================================="

# Permite escolher build de debug ou release
BUILD_TYPE=${1:-debug}
if [ "$BUILD_TYPE" != "debug" ] && [ "$BUILD_TYPE" != "release" ]; then
	print_error "Tipo de build inválido: $BUILD_TYPE. Use 'debug' ou 'release'."
	exit 1
fi

# Verificar dependências
print_step "[1/6] Verificando dependências..."
if ! command -v npx &> /dev/null; then
	print_error "npx não encontrado. Instale Node.js primeiro."
	exit 1
fi
if ! command -v keytool &> /dev/null; then
	print_error "keytool não encontrado. Instale Java JDK primeiro."
	exit 1
fi
print_success "Dependências OK"

# Backup e prebuild
print_step "[2/6] Executando expo prebuild..."
if [ -d "$ANDROID_DIR" ]; then
	print_warning "Pasta android/ já existe."
	# Backup do keystore e gradle.properties
	BACKUP_DIR="/tmp/hobbybichos-backup-$(date +%s)"
	mkdir -p "$BACKUP_DIR"
	if [ -f "$KEYSTORE" ]; then
		cp "$KEYSTORE" "$BACKUP_DIR/"
		print_success "Backup do keystore criado em $BACKUP_DIR"
	fi
	if [ -f "$GRADLE_PROPS" ]; then
		cp "$GRADLE_PROPS" "$BACKUP_DIR/"
		print_success "Backup do gradle.properties criado em $BACKUP_DIR"
	fi
	rm -rf "$ANDROID_DIR"
	npx expo prebuild --platform android --clean
	# Restaurar arquivos
	mkdir -p "$APP_DIR"
	if [ -f "$BACKUP_DIR/hobbybichos-release-key.keystore" ]; then
		cp "$BACKUP_DIR/hobbybichos-release-key.keystore" "$KEYSTORE"
		print_success "Keystore restaurado"
	fi
	if [ -f "$BACKUP_DIR/gradle.properties" ]; then
		cp "$BACKUP_DIR/gradle.properties" "$GRADLE_PROPS"
		print_success "gradle.properties restaurado"
	fi
else
	npx expo prebuild --platform android
fi
print_success "Prebuild concluído"

# PATCH: Fix hermesEnabled error in build.gradle
print_step "[2.5] Aplicando fix do Hermes no build.gradle..."
BUILD_GRADLE="$APP_DIR/build.gradle"
if [ -f "$BUILD_GRADLE" ]; then
    if ! grep -q "def hermesEnabled" "$BUILD_GRADLE"; then
        # Create a temp file to avoid sed issues on different platforms
        awk '/def projectRoot =/ { print; print "def hermesEnabled = (findProperty(\"react.enableHermes\") ?: \"true\").toBoolean()"; next }1' "$BUILD_GRADLE" > "$BUILD_GRADLE.tmp" && mv "$BUILD_GRADLE.tmp" "$BUILD_GRADLE"
        print_success "Fix do Hermes aplicado com sucesso"
    else
        print_success "Fix do Hermes já estava presente"
    fi
else
    print_error "Arquivo build.gradle não encontrado em $BUILD_GRADLE"
    exit 1
fi

# Network Security Config
print_step "[3/6] Criando network_security_config.xml..."
mkdir -p "$XML_DIR"
if [ ! -f "$NETWORK_CONFIG" ]; then
	cat > "$NETWORK_CONFIG" << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
		<base-config cleartextTrafficPermitted="true">
				<trust-anchors>
						<certificates src="system" />
				</trust-anchors>
		</base-config>
		<domain-config cleartextTrafficPermitted="true">
				<domain includeSubdomains="true">localhost</domain>
				<domain includeSubdomains="true">10.0.2.2</domain>
		</domain-config>
</network-security-config>
EOF
	print_success "network_security_config.xml criado"
else
	print_success "network_security_config.xml já existe"
fi

# Keystore
print_step "[4/6] Verificando keystore..."
KEY_PASS=""
if [ -f "$KEYSTORE" ]; then
	print_success "Keystore encontrado: $KEYSTORE"
	# Tentar ler a senha do gradle.properties existente se houver
	if [ -f "$GRADLE_PROPS" ]; then
		KEY_PASS=$(grep "MYAPP_UPLOAD_STORE_PASSWORD" "$GRADLE_PROPS" | cut -d'=' -f2)
	fi
else
	print_warning "Keystore não encontrado. Será criado um novo."
	# Gerar senha aleatória se não existir
	KEY_PASS=$(openssl rand -base64 12)
	
	keytool -genkeypair -v -storetype PKCS12 \
		-keystore "$KEYSTORE" \
		-alias hobbybichos-key \
		-keyalg RSA \
		-keysize 2048 \
		-validity 10000 \
		-storepass "$KEY_PASS" \
		-keypass "$KEY_PASS" \
		-dname "CN=HobbyBichos, OU=Mobile, O=HobbyBichos, L=SaoPaulo, S=SP, C=BR"
	print_success "Keystore criado: $KEYSTORE"
	echo "Senha gerada: $KEY_PASS"
fi

# gradle.properties
print_step "[5/6] Configurando gradle.properties..."

# Se não temos senha ainda (caso keystore já existisse mas sem gradle.properties), pedir ou gerar erro
if [ -z "$KEY_PASS" ]; then
    print_warning "ATENÇÃO: Keystore existe mas não consegui recuperar a senha."
    print_warning "Você precisará configurar manualmente o android/gradle.properties com a senha correta."
else
    # Adicionar configuração de assinatura ao gradle.properties existente
    echo "" >> "$GRADLE_PROPS"
    cat >> "$GRADLE_PROPS" << EOF
# ========================================
# CONFIGURAÇÃO DE ASSINATURA DO APK
# ========================================
# Adicionado automaticamente por build_android.sh

MYAPP_UPLOAD_STORE_FILE=hobbybichos-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=hobbybichos-key
MYAPP_UPLOAD_STORE_PASSWORD=$KEY_PASS
MYAPP_UPLOAD_KEY_PASSWORD=$KEY_PASS
EOF
    print_success "gradle.properties atualizado com configurações de assinatura"
fi

# Build APK
print_step "[6/6] Compilando APK ($BUILD_TYPE)..."
cd "$ANDROID_DIR"
chmod +x ./gradlew
./gradlew clean
./gradlew --stop
sleep 2
if [ "$BUILD_TYPE" = "release" ]; then
	./gradlew :app:assembleRelease --info --stacktrace
	APK_PATH="$APP_DIR/build/outputs/apk/release/app-release.apk"
else
	./gradlew assembleDebug
	APK_PATH="$APP_DIR/build/outputs/apk/debug/app-debug.apk"
fi

echo "================================================="
if [ -f "$APK_PATH" ]; then
	print_success "APK gerado com sucesso!"
	echo "Localização: $APK_PATH"
	SIZE=$(du -h "$APK_PATH" | cut -f1)
	echo "Tamanho: $SIZE"
else
	print_error "ERRO: APK não foi gerado!"
	exit 1
fi
echo "================================================="
cd "$ROOT_DIR"
