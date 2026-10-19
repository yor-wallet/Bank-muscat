# Fonctions Edge (Supabase) — 16.0.0

- `send-email` : e-mails (Brevo). **À déployer avec `verify_jwt = false`** (elle s'authentifie par le secret `x-webhook-secret` de la base).
  Nouveautés : marque Live X Digitale (noir & or), e-mail de bienvenue unique qui annonce la récompense réellement créditée, alerte administrateur
  `ADMIN_NEW_USER`, plus d'e-mail pour la récompense seule (`bonus_in_welcome_email`).
- `push-send` : notifications push (Web Push). **`verify_jwt = true`**. Nouveaux types : `REWARD`, `NEW_USER` (numéro masqué sur l'écran verrouillé).

Ordre de mise en production : 1) migrations `supabase/migrations/20261019_*.sql`, 2) ces deux fonctions, 3) le site (`dist/`).
Les textes des deux fonctions ont été relus contre la version en production (send-email v11, push-send v2).
