# Preparar o commit

O repositório local está na pasta `prisma`. Os arquivos do aplicativo ficam em `dist/`, que é uma pasta de código-fonte estático e deve ser versionada.

Verifique antes do commit:

```powershell
git status
git diff --cached --stat
npm test
npm run check
git commit -m "Expand caves with abandoned mines, roaming goblins and a hidden dwarven clan"
```

O remoto desejado é `https://github.com/Ambrosios13/A-Clareira.git`. Não foi possível consultar seu conteúdo neste ambiente. Antes de enviar, execute `git fetch origin` e verifique se já existe histórico remoto; se existir, integre o projeto nesse histórico em uma branch apropriada. Não use push forçado para substituir arquivos existentes.

Se o remoto estiver vazio e a branch local for `main`:

```powershell
git push -u origin main
```

Caches, logs, arquivos `.env` e o identificador local do Sites em `.openai/` ficam fora do stage. Nenhum commit nem push é realizado pelos scripts do aplicativo. A validação visual no navegador segue pendente.
