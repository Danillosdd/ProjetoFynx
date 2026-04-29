# FYNX Docs Site

Site React para navegar a documentacao Rev06.

Por padrao, os Markdown sao carregados direto do GitHub:

```text
https://raw.githubusercontent.com/TheuusWmv/ProjetoFynx/main/FynxDocs/documento-software/Doc-Tecnica-Rev06/
```

## Rodar

Na pasta do site:

```powershell
cd FynxDocs\docs-site
npm run dev
```

Depois acesse:

```text
http://localhost:4177/docs-site/
```

Para carregar a copia local dos Markdown durante edicao, use:

```text
http://localhost:4177/docs-site/?source=local
```

## Observacoes

- Os Markdown sao carregados dinamicamente do GitHub por padrao.
- A opcao `?source=local` carrega de `FynxDocs/documento-software/Doc-Tecnica-Rev06`.
- Alteracoes locais so aparecem no modo GitHub depois de commit e push para a branch `main`.
- O app usa React no navegador e um servidor Node local pequeno, sem etapa de build.
- Diagramas `mermaid` sao renderizados no navegador via CDN.
- Se abrir o HTML direto pelo explorador de arquivos, o navegador pode bloquear `fetch` dos Markdown. Use `npm run dev`.
