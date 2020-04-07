# Exemples d'intégration des webhooks RDV-Solidarités

Ce dépôt contient des exemples et des routines pour faciliter l'interconnexion avec les webhooks mis en place sur RDV-Solidarités.

## Qu'est ce qu'un webhook

C'est un mécanisme qui permet à RDV-Solidarités de notifier un autre système d'informations.
Cette notification se fait avec un POST en HTTPS.

- [Page wikipedia en anglais](https://en.wikipedia.org/wiki/Webhook)
- [Échanges en anglais sur la sécurisation des webhooks](https://github.com/OWASP/CheatSheetSeries/issues/357)

## Contenu

### Exemple en NextJS/Now

Service disponible https://rdv-solidarites-webhook.now.sh


### Exemple en C#

Des routines d'exmple ont été partagées

- [`sign.cs`](blob/master/c-sharp/sign.cs) montre comment vérifier une signature à partir
  - d'un secret,
  - d'un texte et
  d'une signature de comparaison
- [`json.cs`](blob/master/c-sharp/json.cs) montre comment manipuler le contenu en JSON
- [`Server.cs`](blob/master/c-sharp/Server.cs) est un serveur de base qui vérifie que les requêtes HTTP soit bien signées
