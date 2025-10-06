# Padronização de GitFlow - ChronoTracker

Este documento define o padrão de versionamento, criação de branchs, mensagens de commit e fluxo de trabalho Git adotado pela equipe.  
O objetivo é garantir **organização, rastreabilidade e colaboração eficiente** entre todos os membros do time.

## 1. Configuração Inicial do Git

Cada membro deve configurar seu Git local antes de começar a trabalhar no projeto.

### Configuração do usuário (obrigatória)

 Para facilitar a identificação de quem fez o commit, ideal é que essas configurações sejam as mesmas que o GitHub  
Digitar no terminal
```
git config --global user.name "Seu Nome"
git config --global user.email "seuemail@exemplo.com"
```

Após realizar a configuração é uma boa prática fazer uma verificação se tudo ocorreu corretamente, para isso pode utilizar o comando
```
git config --list
```
## 2. Estruturas Branches

### Branches principais

- **main**: Contém o código em **produção**. Tudo que está aqui deve estar estável e testado.
- **develop**: Branch principal de **desenvolvimento**. Todas as features são integradas aqui antes de ir para produção. O desenvolvimento diário acontece a partir desta branch.

### Branches de suporte

- **feature/xxx**: Para novas funcionalidades. Criadas a partir de `develop`.
- **fix/xxx**: Para correções durante o desenvolvimento. Criadas a partir de `develop`.
- **release/xxx**: Para preparação de novas versões. Criadas a partir de `develop`.
- **hotfix/xxx**: Para correções críticas em produção. Criadas a partir de `main`. -- **Utilizar somente em casos EXTREMOS onde precisa ser feito um ajuste urgente**

## 3. Fluxo de trabalho
### Atualizar a branch local
Antes de começar a trabalhar conferir a branch local e atualizar se necessario
```
git checkout develop # Navega para a branch de desenvolvimento
git pull origin develop # Puxa as últimas alterações do repositório remoto
```

### Cria uma nova branch
Para criar uma nova branch, seja ela sendo feature, fix ou release, executar o comando abaixo
```
git checkout -b feature/nome-da-feature
```
* `checkout -b`: cria a nova branch e já muda para ela.
* `feature/nome-da-feature`: siga o padrão de nome descritivo.

### Subir a branch para o repositório remoto

Utilizar o comando `push` para manter o repositório remoto atualizado
```
git push origin feature/nome-da-feature
```

### Merge da branch
**Após a conclusão da tarefa sempre fazer o merge para a branch `develop`**  
Depois de finalizar a feature e realizar os commits
1. Atualiza a branch da feature com as últimas alterações de `develop`
   ```
   git checkout feature/nome-da-feature
    git pull origin develop --rebase
   ```
   * `rebase`: aplica seus commits por cima dos commits já existentes em develop, mantendo histórico mais linear.
2. Mude para a branch `develop` e faça o merge
    ```
    git checkout develop
    git merge feature/nome-da-feature
    ```
    * `merge`: une os commits da branch da feature na branch develop.
3. Envia a branch `develop`atualizada para o remoto
   ```
   git push origin develop
   ```
4. Depois do merge e que a branch ja foi testada e validada pode deletar a branch local e remota da feature
    **tomar cuidado com este comando para não deletar as branches principais**
   
### Convenções de commits
Vamos adotar a padronização inspirado no **convencional commit**  
    Template para estrutura do commit  
    `<tipo>`(escopo opcional): mensagem curta e clara  
**Importante fazer commits pequenos e frequentes**

- `feat: descrição` - nova funcionalidade
- `fix: descrição` - correção de bug
- `docs: descrição` - alteração em documentação
- `style: descrição` - mudanças de formatação (espaços, identação, ponto e vírgula)
- `refactor: descrição` - refatoração de código
- `chore: descrição` - tarefas de manutenção

  **Exemplo**
  ```
  git commit -m "fix(api): corrige erro de autenticação"
  ```

## Sugestões de Boas Práticas

* Faça commits pequenos e frequentes.
* Sempre puxe atualizações antes de começar (git pull).
* Sempre mantenha o colega informado sobre as alterações que você estiver fazendo, isto evita conflitos.

### Fluxo de trabalho

1. **Desenvolvimento de feature**:
      ```
      # 1. Navegar para develop e atualizar
    git checkout develop      # muda para a branch de desenvolvimento
    git pull origin develop   # atualiza com commits remotos

    # 2. Criar nova branch de feature
    git checkout -b feature/nome-da-feature  # cria e entra na nova branch

    # 3. Trabalhar e fazer commits pequenos
    git add .                 # adiciona arquivos modificados
    git commit -m "feat: descrição da feature"  # commit com mensagem padronizada

    # 4. Subir branch para remoto
    git push origin feature/nome-da-feature

    # 5. Atualizar feature com develop (rebase)
    git pull origin develop --rebase

    # 6. Merge da feature para develop
    git checkout develop
    git merge feature/nome-da-feature

    # 7. Enviar develop atualizado para remoto
    git push origin develop

    # 8. Deletar branch da feature
    git branch -d feature/nome-da-feature
    git push origin --delete feature/nome-da-feature
   ```
