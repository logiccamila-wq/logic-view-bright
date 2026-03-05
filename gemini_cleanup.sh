#!/usr/bin/env bash
set -euo pipefail

OUTDIR="${HOME}/meus-projetos/gemini-troubleshoot"
mkdir -p "$OUTDIR"

pause() {
  read -rp "$* [ENTER para continuar]"
}

confirm() {
  read -rp "$1 (s/n): " ans
  case "$ans" in
    [Ss]*) return 0 ;;
    *) return 1 ;;
  esac
}

echo "==> Checando uso de disco (partições)"
df -h
echo
echo "==> Maiores diretórios no seu HOME (profundidade 1)"
du -h --max-depth=1 "$HOME" 2>/dev/null | sort -hr | head -n 20
echo
echo "==> Maiores arquivos no HOME (top 30)"
find "$HOME" -type f -printf "%s\t%p\n" 2>/dev/null | sort -nr | head -n 30 | awk '{printf "%.2f MB\t%s\n", $1/1024/1024, $2}'
echo
pause "Revise os itens acima."

# ------------- Limpeza npm (safe) -------------
if confirm "Deseja limpar cache do npm e remover diretórios ~/.npm/_cacache ~/.npm/_logs ~/.npm/_npx?"; then
  echo "Executando npm cache clean --force (pode pedir permissões de usuário)..."
  npm cache clean --force || echo "npm cache clean falhou ou npm não está instalado; ignorando."
  echo "Removendo diretórios de cache do npm (será solicitado confirmação)..."
  for d in ~/.npm/_cacache ~/.npm/_logs ~/.npm/_npx; do
    if [ -e "$d" ]; then
      echo "Apagando $d"
      rm -rf "$d"
    else
      echo "Não existe: $d"
    fi
  done
  echo "Cache npm limpo."
else
  echo "Pulando limpeza do npm."
fi
echo

# ------------- Limpeza apt (Debian/Ubuntu) -------------
if confirm "Seu sistema parece Debian/Ubuntu. Deseja executar apt autoremove/autoclean/clean (requer sudo)?"; then
  echo "Executando sudo apt-get autoremove -y && sudo apt-get autoclean -y && sudo apt-get clean -y"
  sudo apt-get autoremove -y || true
  sudo apt-get autoclean -y || true
  sudo apt-get clean -y || true
  echo "Limpeza apt concluída."
else
  echo "Pulando limpeza apt."
fi
echo

# ------------- Limpeza journalctl -------------
if command -v journalctl >/dev/null 2>&1; then
  if confirm "Deseja reduzir logs do systemd (journalctl) para 200MB? (sudo será usado)"; then
    sudo journalctl --vacuum-size=200M || echo "Falha ao vacuum do journalctl (talvez não haja journalctl)."
    echo "Logs do journal reduzidos (se aplicável)."
  else
    echo "Pulando vacuum do journalctl."
  fi
fi
echo

# ------------- Docker (opcional) -------------
if command -v docker >/dev/null 2>&1; then
  if confirm "Você usa Docker? Deseja dar um prune (remove images/containers/networks não usados)?"; then
    docker system prune -af || echo "docker system prune falhou (verifique docker daemon)."
    echo "Docker prune executado."
  else
    echo "Pulando docker prune."
  fi
fi
echo

# ------------- Node modules cleanup helper (não remover automaticamente) -------------
if confirm "Deseja listar node_modules grandes encontrados em ~/ (para análise)?"; then
  echo "Buscando node_modules (isso pode demorar)..."
  find ~ -type d -name "node_modules" -prune -print0 2>/dev/null | xargs -0 -I {} du -sh {} 2>/dev/null | sort -hr | head -n 40
  echo "Se quiser remover um node_modules específico, rode manualmente: rm -rf /caminho/para/node_modules"
else
  echo "Pulando busca por node_modules."
fi
echo

# ------------- Rodar gemini e capturar saída -------------
echo "Para rodar gemini e salvar saída, passe os argumentos do gemini para este script."
echo "Ex.: ./gemini_cleanup.sh <args do gemini>"

GEMINI_ARGS=("$@")
if [ "${#GEMINI_ARGS[@]}" -gt 0 ]; then
  OUTFILE="${OUTDIR}/gemini_out_$(date +%Y%m%d_%H%M%S).json"
  echo "Executando: gemini ${GEMINI_ARGS[*]}"
  echo "Saída será salva em: $OUTFILE"
  gemini "${GEMINI_ARGS[@]}" >"$OUTFILE" 2>&1 || echo "O comando gemini retornou não-zero; ver arquivo $OUTFILE para detalhes."
  echo "Saída salva em $OUTFILE"
  if command -v jq >/dev/null 2>&1; then
    if jq . "$OUTFILE" >/dev/null 2>&1; then
      echo "JSON válido."
    else
      echo "JSON inválido ou saída não é JSON. Tentando localizar erro..."
      echo "Mostrando as 500 primeiras linhas do arquivo para inspeção:"
      sed -n '1,500p' "$OUTFILE"
      echo
      echo "Se você recebeu uma mensagem de erro com linha/coluna (ex: line 397 column 19), use a função show_json_context <arquivo> <linha>"
    fi
  else
    echo "Instale 'jq' para validação JSON (sudo apt install jq)."
  fi
else
  echo "Nenhum argumento do gemini passado; pulei a execução do gemini."
fi
echo

# ------------- Função para mostrar linhas ao redor de uma linha informada -------------
show_json_context() {
  local file="$1"
  local line="$2"
  local ctx=10
  echo "Mostrando linhas $((line-ctx)) a $((line+ctx)) de $file"
  sed -n "$((line-ctx)),$((line+ctx))p" "$file" 2>/dev/null || echo "Não foi possível exibir (verifique caminho/perm)."
}

# ------------- Aux: validação rápida de um arquivo json específico -------------
if [ -n "${SHOW_JSON_FILE:-}" ] 2>/dev/null || false; then
  if [ -f "$SHOW_JSON_FILE" ]; then
    echo "Validando $SHOW_JSON_FILE com jq..."
    jq . "$SHOW_JSON_FILE" || echo "JSON inválido."
  else
    echo "Variável SHOW_JSON_FILE definida mas arquivo não existe."
  fi
fi

echo "Todas as operações concluídas. Arquivos e logs foram salvos em: $OUTDIR"
echo "Se quiser, cole aqui as linhas em torno da posição reportada (ex: line 397) e eu ajudo a achar o problema de sintaxe."