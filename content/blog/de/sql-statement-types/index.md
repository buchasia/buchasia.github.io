---
title: SQL-Anweisungstypen
date: "2025-04-03T15:13:03.284Z"
description: "SQL-Anweisungen werden in drei Haupttypen unterteilt: DDL (Data Definition Language), DCL (Data Control Language) und DML (Data Manipulation Language)."
tags: [datenbanken, sql]
---

SQL steht für _Structured Query Language_ und kann verwendet werden, um mit einer relationalen Datenbank zu kommunizieren. Fast jeder Backend-Entwickler dürfte, je nach zugrunde liegendem Datenbanksystem, bereits Kontakt mit der einen oder anderen Form von SQL gehabt haben.

## SQL-Anweisungstypen

SQL-Anweisungen lassen sich in drei Hauptgruppen einteilen:

- __Data Definition Language (DDL)__ – Mit DDL-Anweisungen können wir mit der Datenbank interagieren, um Tabellen und andere Datenbankobjekte zu erstellen, zu ändern und zu löschen. Einige gängige DDL-Anweisungen sind:


| Anweisung   | Verwendung |
|-----------|-------|
| CREATE    | Um ein neues Datenbankobjekt zu erstellen, wie eine Tabelle, eine View oder eine gespeicherte Prozedur |
| ALTER    | Um ein bestehendes Datenbankobjekt zu ändern, zum Beispiel den Datentyp einer Tabellenspalte |
| RENAME    | Um ein bestehendes Datenbankobjekt umzubenennen |
| DROP    | Um ein bestehendes Datenbankobjekt zu löschen |

**Tabelle 1:** Gängige DDL-Anweisungen

<details>
<summary>Beispiel für eine Create-Anweisung</summary>

```sql
CREATE TABLE Person
(
    ID INT PRIMARY KEY,
    Name VARCHAR(40) NOT NULL,
    Age DECIMAL NULL,
    Country VARCHAR(128) NOT NULL,
);
```
_Die für Spalten verfügbaren Datentypen können sich von einem Datenbanksystem zum anderen unterscheiden._
</details>

- __Data Control Language (DCL)__ – Mit DCL-Anweisungen können wir den Zugriff auf Objekte in einer Datenbank verwalten. Einige gängige DCL-Anweisungen sind:


| Anweisung   | Verwendung |
|-------------|-------|
| GRANT    | Um die Berechtigung zu erteilen, eine bestimmte Aktion oder Aktionen an einem Datenbankobjekt auszuführen |
| DENY    | Um die Berechtigung zu verweigern, eine bestimmte Aktion oder Aktionen an einem Datenbankobjekt auszuführen |
| REVOKE    | Um eine zuvor erteilte Berechtigung zu widerrufen |

**Tabelle 1:** Gängige DCL-Anweisungen

<details>
<summary>Beispiel für eine Grant-Anweisung</summary>

```sql
GRANT SELECT, INSERT
ON Person
TO user1;
```
</details>

- __Data Manipulation Language (DML)__ – Mit DML-Anweisungen können wir die Datenzeilen in den Tabellen bearbeiten. Sie ermöglichen es uns, neue Zeilen zu erstellen sowie bestehende Zeilen abzurufen, zu ändern oder zu löschen. Dies sind auch die am häufigsten verwendeten Anweisungen. Einige gängige DML-Anweisungen sind:


| Anweisung   | Verwendung |
|-----------|-------|
| INSERT    | Um eine neue Zeile in einer Tabelle zu erstellen |
| SELECT    | Um Zeilen aus einer Tabelle zu lesen |
| DELETE    | Um bestehende Zeilen aus einer Tabelle zu löschen |
| UPDATE    | Um bestehende Zeilen in einer Tabelle zu ändern |

**Tabelle 1:** Gängige DML-Anweisungen

<details>
<summary>Beispiel für eine Select-Anweisung</summary>

```sql
SELECT *
FROM Person
WHERE Name = 'Example';
```
</details>
