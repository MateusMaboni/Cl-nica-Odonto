# Sereno — protótipo de plataforma odontológica

Este é um protótipo de interface feito com HTML, CSS e JavaScript puro.

## Como abrir
1. Extraia o arquivo ZIP.
2. Abra `index.html` em um navegador moderno.
3. Use o seletor "Visualizar como" para alternar entre Profissional e Paciente.

## O que funciona nesta demonstração
- Alternância entre a área do profissional e a área do paciente.
- Navegação entre páginas.
- Adicionar perfis de pacientes fictícios e filtrar a lista.
- Criar métodos, escolher categoria e marcar como privado ou compartilhado.
- Comunidade demonstrativa com métodos de exemplo e ação de criar uma cópia privada.
- Adicionar orientações à rotina e marcar itens como concluídos.
- Preferências ilustrativas e mensagens de confirmação.

## Limitações importantes
- Os dados ficam somente na memória da página e são perdidos ao recarregar.
- Não há login, banco de dados, sincronização entre médico e paciente, envio de notificações ou permissões reais.
- Não use dados reais, identificáveis ou informações clínicas de pacientes.
- O compartilhamento público é apenas simulado; os exemplos da comunidade são fictícios.
- Antes de usar em ambiente real, será necessário desenvolver backend, autenticação, autorização por função, registro de auditoria, criptografia, cópias de segurança, consentimentos e controles de privacidade adequados à LGPD e às regras profissionais aplicáveis.
- Métodos compartilhados devem ser identificados como contribuições profissionais e não como recomendações clínicas automaticamente validadas.

## Estrutura
- `index.html` — estrutura das páginas e formulários.
- `styles.css` — identidade visual responsiva.
- `app.js` — navegação e interações da demonstração.
