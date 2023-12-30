# ledouxIndexing
Formulaire pour l'indexation de l'Architecture de C.N. Ledoux. 
Ce formulaire permet d'indexer des passages du texte, d'ajouter des concepts et des renvois dans l'index, et de repérer les fragments indexés.

## Prérequis
Ce formulaire a été réalisé avec [XForms](https://www.w3.org/TR/xforms/). Il nécessite un client pour s'exécuter. Nous recommandons [XSLTForms](https://github.com/AlainCouthures/declarative4all/tree/master) ([lien de téléchargement](https://github.com/AlainCouthures/declarative4all/releases/tag/XSLTForms)).

XSLTForms repose sur l'utilisation d'une feuille de transformation XSLT, pour exécuter le formulaire, il est donc nécessaire que les fichiers soient déposés sur un espace serveur, local ou en ligne.

## Description
```
├── fonts
│   └── // Une collection de polices de caractères pour l'Architecture de Ledoux
├── img
│   └── // Une collection d'images 
├── js
│   └── production.min.js // librairie JS pour le design de la page 
├── architecture.xml // page web contenant l'Architecture de Ledoux et le formulaire
├── concepts.xml // instance XML-TEI contenant l'index
├── indexing.css // feuille de style du formulaire d'indexation
├── indexing.js // librairie js utilisée pour le formulaire d'indexation
├── LICENSE
├── README.md
└── style.css // feuille de style pour le design de la page
```