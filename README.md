# Forge Studio — Protótipo

Protótipo navegável de um SaaS para criação e análise de modelos 3D.

## Rodar no computador

```bash
npm install
npm run dev
```

Depois abra o endereço mostrado no terminal.

## Publicar na Vercel

1. Extraia o ZIP.
2. Envie a pasta para um repositório do GitHub.
3. Importe o repositório na Vercel.
4. Framework: Vite.
5. Build command: `npm run build`.
6. Output directory: `dist`.

## O que funciona

- Dashboard responsivo
- Upload real de imagens
- Miniaturas das imagens
- Configuração do projeto
- Processamento animado
- Resultado 3D demonstrativo
- Histórico local durante a sessão
- Download de arquivo demonstrativo

## Transparência

A reconstrução 3D ainda é simulada. O protótipo serve para apresentar a experiência e validar o interesse de clientes sem afirmar que a IA real já está pronta.


## Versão premium para apresentação

Esta revisão adiciona:
- identificação explícita de Protótipo Beta;
- painel visual Referência → Modelo;
- resultado com aviso de demonstração;
- acabamento extra para apresentação comercial.

A geração automática de STL permanece simulada.


## Fase 1 concluída
- Upload com miniaturas reais
- Nome, resolução e tamanho das imagens
- Indicador de qualidade das referências
- Resumo de quantidade e tamanho total
