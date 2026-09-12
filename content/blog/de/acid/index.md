---
title: Das ACID-Prinzip
date: "2025-04-01T15:13:03.284Z"
description: "ACID stellt sicher, dass Datenbanktransaktionen atomar (alles oder nichts), konsistent (gültiger Zustand bleibt erhalten), isoliert (unabhängige Ausführung) und dauerhaft (nach dem Commit bestehen bleibend) sind."
tags: [datenbanken, transaktionen]
---

Fast jeder von uns nutzt auf die eine oder andere Weise Datenbanksysteme. Diese Datenbanksysteme können Teil der Apps sein, die wir auf unserem Handy haben, oder von Websites, die wir über unseren Browser nutzen.

Schauen wir uns ein Beispiel an, das für uns alle leicht nachzuvollziehen ist. Nehmen wir an, wir überweisen jemandem Geld von unserem Konto auf ein anderes Konto. Stellt euch nun vor, es gäbe während der Verarbeitung ein Problem, sodass das Geld von unserem Konto abgebucht, aber dem anderen Konto nicht gutgeschrieben wird. Das wäre für alle Beteiligten wirklich problematisch, sogar für die Bank, um solche Fehler zu korrigieren.

Wie stellen wir also sicher, dass solche Situationen nicht allzu oft auftreten, angesichts all der möglichen Probleme, die entstehen könnten? Das wird dadurch sichergestellt, dass Datenbanktransaktionen den Eigenschaften folgen, die zusammen **A**tomarität, **C**onsistency (Konsistenz), **I**solation und **D**urability (Dauerhaftigkeit) genannt werden, kurz _ACID_.

> Eine Datenbanktransaktion ist eine Abfolge von Operationen, die als eine einzige, atomare Arbeitseinheit ausgeführt wird und den ACID-Eigenschaften folgt.

Schauen wir uns diese Eigenschaften einzeln an und was sie bedeuten:

- __Atomarität__: Eine Datenbanktransaktion besteht aus mehreren Änderungen an einer oder mehreren Tabellen. Bei einer Geldüberweisung müssen zum Beispiel zunächst Validierungen durchgeführt werden, dann wird das Geld von meinem Konto abgezogen und anschließend dem Konto der anderen Person gutgeschrieben. Es müssen also mehrere Änderungen angewendet werden.

  Atomarität garantiert, dass jede Transaktion als eine einzige Einheit behandelt wird. Entweder sind also alle Änderungen erfolgreich oder keine von ihnen wird angewendet. Im Falle eines Fehlers bleibt die Datenbank also unverändert. Teilweise Aktualisierungen sind daher nicht möglich.

- __Konsistenz__: Diese Eigenschaft stellt sicher, dass eine Transaktion die Datenbank nur von einem gültigen Zustand in einen anderen gültigen Zustand überführen kann. Dabei werden alle Regeln eingehalten (z. B. Constraints, Trigger). In unserem Beispiel würde das bedeuten, dass am Ende der korrekte Geldbetrag von meinem Konto abgebucht und derselbe Betrag dem Konto der anderen Person gutgeschrieben wurde. Wenn außerdem eine Regel negative Kontostände verbietet, sollte die Überweisung fehlschlagen und kein Geld ausgetauscht werden.

- __Isolation__: Betrachten wir ein weiteres Beispiel, bei dem zwei Nutzer das letzte Ticket für einen Flug buchen möchten. In diesem Fall sollte nur einer erfolgreich sein, um eine doppelte Buchung zu verhindern. Genau das stellt die Isolationseigenschaft sicher.

  Transaktionen müssen unabhängig voneinander ausgeführt werden, ohne sich gegenseitig zu beeinflussen, sodass gleichzeitige Transaktionen keine Inkonsistenzen verursachen.

- __Dauerhaftigkeit__: Sobald eine Transaktion committet wurde, bleibt sie bestehen, selbst im Falle eines Systemausfalls. In unserem Beispiel bedeutet das: Sobald die Überweisung stattgefunden hat und die Änderungen in der Datenbank committet wurden, dürfen diese bei einem Systemabsturz und einer Wiederherstellung nicht verloren gehen.

> Ein Commit speichert alle in einer Transaktion vorgenommenen Änderungen dauerhaft in der Datenbank.

ACID macht Datenbanken robust, zuverlässig und vertrauenswürdig und verhindert Datenkorruption und Inkonsistenzen. Ob Entwickler, Data Engineer oder Technikbegeisterter – das Verständnis von ACID ist entscheidend für den Aufbau skalierbarer und ausfallsicherer Systeme.

### Referenzen
1. [ACID auf Wikipedia](https://en.wikipedia.org/wiki/ACID)
