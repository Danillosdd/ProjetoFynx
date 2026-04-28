# FYNX Docs Site

Site React para navegar a documentacao Rev06.

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

## Observacoes

- Os Markdown sao carregados dinamicamente de `FynxDocs/documento-software/Doc-Tecnica-Rev06`.
- O app usa React no navegador e um servidor Node local pequeno, sem etapa de build.
- Diagramas `mermaid` sao renderizados no navegador via CDN.
- Se abrir o HTML direto pelo explorador de arquivos, o navegador pode bloquear `fetch` dos Markdown. Use `npm run dev`.
