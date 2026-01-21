
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
if [ -f "$KEYSTORE" ]; then
	print_success "Keystore encontrado: $KEYSTORE"
else
	print_warning "Keystore não encontrado. Será criado um novo."
	keytool -genkeypair -v -storetype PKCS12 \
		-keystore "$KEYSTORE" \
		-alias hobbybichos-key \
		-keyalg RSA \
		-keysize 2048 \
		-validity 10000
	print_success "Keystore criado: $KEYSTORE"
fi

# gradle.properties
print_step "[5/6] Configurando gradle.properties..."
if [ ! -f "$GRADLE_PROPS_EXAMPLE" ]; then
	cat > "$GRADLE_PROPS_EXAMPLE" << 'EOF'
# ========================================
# CONFIGURAÇÃO DE ASSINATURA DO APK
# ========================================
# IMPORTANTE: Copie este arquivo para gradle.properties
# e preencha com suas senhas reais

# Caminho do keystore
MYAPP_UPLOAD_STORE_FILE=hobbybichos-release-key.keystore

# Alias da chave (definido ao criar keystore)
MYAPP_UPLOAD_KEY_ALIAS=hobbybichos-key

# Senhas (NUNCA COMMITE ESTE ARQUIVO!)
MYAPP_UPLOAD_STORE_PASSWORD=SUA_SENHA_AQUI
MYAPP_UPLOAD_KEY_PASSWORD=SUA_SENHA_AQUI

# Outras configurações do Gradle
android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
EOF
	print_success "gradle.properties.example criado"
fi
if [ ! -f "$GRADLE_PROPS" ]; then
	print_error "gradle.properties não encontrado!"
	echo "Copie o exemplo: cp android/gradle.properties.example android/gradle.properties"
	exit 1
fi
if grep -q "SUA_SENHA_AQUI" "$GRADLE_PROPS"; then
	print_error "Senhas não foram configuradas no gradle.properties!"
	echo "Edite o arquivo e substitua 'SUA_SENHA_AQUI' pela senha real."
	exit 1
fi
print_success "gradle.properties configurado"

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
