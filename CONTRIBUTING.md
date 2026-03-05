# Contribuindo para OPTILOG

Primeiramente, obrigado por considerar contribuir para o OPTILOG! 🎉

Somos um projeto open source desenvolvido com o objetivo de revolucionar a gestão de transportadoras no Brasil. Suas contribuições são essenciais para tornar este projeto ainda melhor.

## 🌟 Código de Conduta

Este projeto e todos os participantes estão regidos pelo nosso [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você concorda em respeitar este código.

## 🚀 Como Contribuir

### Reportando Bugs

Antes de criar um issue, por favor verifique se o bug já não foi reportado. Se encontrar um issue similar, adicione informações adicionais como comentário.

**Ao criar um novo issue de bug, inclua:**

- Descrição clara e título descritivo
- Passos exatos para reproduzir o problema
- Comportamento esperado vs comportamento observado
- Screenshots, se aplicável
- Informações do ambiente (navegador, sistema operacional, versão do Node.js)

### Sugerindo Melhorias

Issues de sugestões são bem-vindos! Ao criar uma sugestão:

- Use um título claro e descritivo
- Forneça uma descrição detalhada da melhoria
- Explique por que esta melhoria seria útil
- Liste exemplos de como a feature funcionaria

### Pull Requests

1. **Fork o repositório** e crie sua branch a partir da `main`:
   ```bash
   git checkout -b feature/minha-feature
   ```

2. **Faça suas alterações** seguindo nossos padrões de código:
   - Use TypeScript para código frontend
   - Siga as convenções de nomenclatura existentes
   - Adicione comentários quando necessário
   - Escreva mensagens de commit claras e descritivas

3. **Teste suas alterações:**
   ```bash
   npm run lint
   npm run build
   npm run test:e2e
   ```

4. **Commit suas alterações:**
   ```bash
   git commit -m "feat: adiciona nova funcionalidade X"
   ```

   Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` nova funcionalidade
   - `fix:` correção de bug
   - `docs:` alterações na documentação
   - `style:` formatação, sem alteração de código
   - `refactor:` refatoração de código
   - `test:` adição ou correção de testes
   - `chore:` tarefas de manutenção

5. **Push para sua branch:**
   ```bash
   git push origin feature/minha-feature
   ```

6. **Abra um Pull Request** no GitHub

### Padrões de Código

**TypeScript/JavaScript:**
- Use TypeScript sempre que possível
- Evite `any`, prefira tipos específicos
- Use arrow functions para callbacks
- Use `const` por padrão, `let` quando necessário, nunca `var`

**React/Next.js:**
- Componentes funcionais com hooks
- Organize imports: externos → internos → tipos
- Um componente por arquivo (exceto componentes auxiliares pequenos)

**CSS/Styling:**
- Use Material-UI (MUI) para componentes
- Evite inline styles sempre que possível
- Use o tema do MUI para consistência

**Backend:**
- Use async/await ao invés de callbacks
- Sempre trate erros adequadamente
- Valide inputs do usuário
- Documente APIs com comentários JSDoc

## 📁 Estrutura do Projeto

```
optilog.app/
├── app/                    # Next.js App Router
│   ├── frota/             # Módulo de gestão de frota
│   ├── finance/           # Módulo financeiro
│   └── ...
├── backend/               # Backend Node.js/Express
│   ├── routes/            # Rotas da API
│   ├── scripts/           # Scripts de banco de dados
│   └── ...
├── components/            # Componentes React reutilizáveis
├── lib/                   # Bibliotecas e utilitários
└── public/                # Arquivos estáticos
```

## 🧪 Testando

Antes de submeter um PR, certifique-se de que:

- [ ] O código passa no linter: `npm run lint`
- [ ] O build é bem-sucedido: `npm run build`
- [ ] Todos os testes passam: `npm run test:e2e` (se disponível)
- [ ] Você testou manualmente suas alterações
- [ ] A documentação foi atualizada (se necessário)

## 📝 Documentação

Contribuições para a documentação são extremamente valiosas! Se você:

- Encontrar erros de digitação ou gramática
- Quiser adicionar exemplos
- Puder melhorar explicações
- Tiver sugestões para novos tutoriais

Por favor, sinta-se à vontade para contribuir!

## 🎯 Áreas Prioritárias

Estamos especialmente procurando contribuições em:

- **IA/ML**: Modelos de previsão e otimização
- **Integrações**: Google Drive, sistemas fiscais (SPED, CT-e)
- **Mobile**: App React Native
- **Testes**: Cobertura de testes automatizados
- **Documentação**: Tutoriais e guias de uso
- **Internacionalização**: Traduções (Espanhol, Inglês)

## 💬 Dúvidas?

Se tiver dúvidas sobre como contribuir, sinta-se à vontade para:

- Abrir um issue com a tag `question`
- Entrar em contato através do email: contato@camilalareste.com.br

## 🙏 Agradecimentos

Obrigado por dedicar seu tempo para contribuir com o OPTILOG! Sua ajuda é fundamental para tornar este o melhor sistema de gestão de transportadoras do Brasil.

---

**Desenvolvido com ❤️ por Camila Lareste e a comunidade OPTILOG**
