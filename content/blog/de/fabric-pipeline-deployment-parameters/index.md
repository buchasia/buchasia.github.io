---
title: Fabric-Pipeline-Bereitstellung mit Parametern
date: "2026-09-12T10:00:00.000Z"
description: "So verwalten Sie umgebungsspezifische Werte für eine Microsoft-Fabric-Pipeline mit Variablenbibliotheken und Wertemengen."
tags: [microsoft fabric, data]
---

Wenn eine Datenpipeline von der Entwicklung in die Produktion überführt wird, sollte die Logik der Pipeline meist gleich bleiben, während sich ihre Konfiguration ändert. Beispiele sind Notebook-Parameter, Datenbanknamen, Workspace-IDs und Grenzwerte. Variablenbibliotheken in Microsoft Fabric ermöglichen es, diese Werte zentral zu verwalten und zwischen Umgebungen zu wechseln, ohne jede Pipeline-Aktivität bearbeiten zu müssen.

In diesem Beitrag erstellen wir eine Variablenbibliothek für eine Fabric-Pipeline und verwenden Wertemengen für umgebungsspezifische Konfigurationen. Das Beispiel nutzt drei Parameter:

- `LowerLimit`, eine Ganzzahl mit dem Standardwert `10`;
- `UpperLimit`, eine Ganzzahl mit dem Standardwert `100`; und
- `MeanValue`, eine Zahl mit dem Standardwert `17.45`.

Die Werte dienen nur als Beispiel. In einem echten Projekt könnten hier Verbindungsdaten, Speicherpfade, Workspace-Namen oder andere umgebungsspezifische Werte stehen.

## Pipeline und Standardparameter

Ausgangspunkt ist eine Pipeline mit einer Notebook-Aktivität. Die Aktivität verwendet die unten gezeigten Standardparameter.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/pipeline-with-default-parameters.png" alt="Fabric-Pipeline mit Standardparametern für das Notebook" /></div>

Im Screenshot ist die Notebook-Aktivität ausgewählt. Im Bereich **Settings** sind die Basisparameter `LowerLimit`, `UpperLimit` und `MeanValue` auf `10`, `100` und `17.45` gesetzt. So lässt sich die ursprüngliche Konfiguration später mit den Werten einer anderen Wertemenge vergleichen.

## Variablenbibliothek erstellen

Öffnen Sie den Fabric-Workspace und wählen Sie **New item**. Unter den Workspace-Elementen steht **Variable library** zur Verfügung.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/vl-in-new-item.png" alt="Variable library im Menü New item" /></div>

Wählen Sie **Variable library**, vergeben Sie einen aussagekräftigen Namen und wählen Sie den Speicherort im Workspace. In diesem Beispiel heißt die Bibliothek `vl_my_values`.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/vl-name-your-vl.png" alt="Neue Variablenbibliothek erstellen" /></div>

Nach dem Erstellen enthält die Bibliothek zunächst noch keine Variablen.

Die Bibliothek dient als zentrale Ablage für Variablen, die von mehreren Fabric-Elementen verwendet werden können. So müssen gemeinsam genutzte Konfigurationswerte nicht in jeder Pipeline separat gepflegt werden.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/vl-new-variable-button.png" alt="Leere Variablenbibliothek" /></div>

Wählen Sie **New variable**, um die erste Variable anzulegen. Wiederholen Sie den Schritt, bis alle zentral zu verwaltenden Werte vorhanden sind.

## Standardvariablen hinzufügen

Legen Sie die drei oben genannten Variablen mit passenden Namen und Datentypen an.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/vl-create-variables.png" alt="Variablen in der Standardwertemenge" /></div>

Die Standardwertemenge enthält `LowerLimit`, `UpperLimit` und `MeanValue`. Die ersten beiden sind Ganzzahlen, `MeanValue` ist eine Zahl. Die Werte sind `10`, `100` und `17.45`.

Die Typen sollten zu den Parametern der Notebook- oder Pipeline-Aktivität passen. Dadurch werden unnötige Konvertierungen und unerwartete Vergleiche vermieden.

Verwenden Sie möglichst dieselben Namen für Bibliotheksvariablen und Pipelineparameter. Dadurch bleibt die Zuordnung nachvollziehbar und Fehler beim Ersetzen der festen Werte werden vermieden.

## Bibliotheksvariablen in der Pipeline verwenden

Öffnen Sie den Ausdruckseditor der Pipeline und wechseln Sie zum Tab **Library variables**. Über **+** können Sie eine Bibliotheksvariable zur Pipeline hinzufügen.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/pl-add-library-variables-to-pipeline.png" alt="Bibliotheksvariablen zur Pipeline hinzufügen" /></div>

Der Ausdruckseditor öffnet zunächst den Tab **Parameters**. Öffnen Sie die Tab-Auswahl und wählen Sie **Library variables**.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/pl-switch-to-library-variables.png" alt="Im Ausdruckseditor zu Bibliotheksvariablen wechseln" /></div>

Nun werden die Variablen der Bibliothek angezeigt, darunter `vl_my_values_LowerLimit`, `vl_my_values_UpperLimit` und `vl_my_values_MeanValue`.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/pl-variable-now-present-for-pl.png" alt="Bibliotheksvariablen in der Pipeline" /></div>

Wählen Sie für den Parameter `LowerLimit` das Wertefeld und anschließend **Add dynamic content**.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/pl-add-dynamic-content-for-value.png" alt="Dynamischen Inhalt für einen Pipelineparameter hinzufügen" /></div>

Wählen Sie im Ausdruckseditor **Library variables** und anschließend die passende Variable aus.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/pl-select-variable-from-library.png" alt="Variable aus der Variablenbibliothek auswählen" /></div>

Fabric fügt einen Ausdruck ähnlich dem folgenden ein:

```text
@pipeline().libraryVariables.vl_my_values_LowerLimit
```

Das Feld enthält nun keine feste Zahl mehr. Beim Ausführen löst Fabric den aktiven Wert aus der Variablenbibliothek auf.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/pl-final-dynamic-content.png" alt="Dynamischer Ausdruck mit einer Bibliotheksvariablen" /></div>

Wiederholen Sie den Vorgang für `UpperLimit` und `MeanValue`. Danach verwenden alle Notebook-Parameter die aktiven Werte der Bibliothek.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/pl-final-all-nb-parameters.png" alt="Alle Notebookparameter verwenden Bibliotheksvariablen" /></div>

So ändert sich bei einem Wechsel der aktiven Wertemenge die Konfiguration, während Pipeline und Notebook unverändert bleiben.

Prüfen Sie die aufgelösten Werte zunächst in einer nicht-produktiven Ausführung, bevor Sie eine andere Wertemenge für eine Produktionsausführung aktivieren.

## Alternative Wertemenge hinzufügen

Für die Produktion werden häufig andere Grenzwerte benötigt. Wählen Sie **Add value set**, um eine weitere Gruppe von Werten anzulegen.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/vl-add-value-set.png" alt="Wertemenge hinzufügen" /></div>

Geben Sie einen Namen ein. In diesem Beispiel heißt die alternative Wertemenge `PROD`.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/vl-name-alternate-value-set.png" alt="Alternative Wertemenge benennen" /></div>

Die neue Wertemenge enthält dieselben Variablen, kann aber andere Werte verwenden: `5`, `120` und `18.45`.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/vl-final-with-alternate.png" alt="Standard- und Produktionswertemenge" /></div>

Die Variablennamen und Datentypen bleiben gleich, während sich nur die Werte ändern. So muss die Pipeline-Logik nicht für jede Umgebung dupliziert werden.

## Aktive Wertemenge auswählen

Es ist immer nur eine Wertemenge aktiv. Öffnen Sie das Menü der alternativen Wertemenge und wählen Sie **Set as active**.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/vl-set-active.png" alt="Produktionswertemenge als aktiv setzen" /></div>

Die aktive Wertemenge wird verwendet, wenn Fabric die Variablen auflöst. Prüfen Sie deshalb vor einer Ausführung oder Bereitstellung, dass die richtige Wertemenge aktiv ist.

Der Name `PROD` macht eine Wertemenge nicht automatisch sicher. Entscheidend ist, welche Wertemenge derzeit aktiv ist.

Fabric zeigt vor der Änderung einen Hinweis zur Auswirkungsanalyse an.

<div align="center"><img src="/images/fabric-pipeline-deployment-parameters/vl-impact-awareness.png" alt="Warnung zur Auswirkungsanalyse" /></div>

Die Warnung erinnert daran, dass eine Änderung alle abhängigen Elemente beeinflussen kann. Prüfen Sie die verwendenden Pipelines, Notebooks und anderen Elemente, bevor Sie die Änderung bestätigen.

Wenn Umgebungen unabhängig voneinander betrieben werden müssen, sollte die Aktivierung Teil des Bereitstellungsprozesses sein. Dokumentieren Sie außerdem, wer diese Änderung durchführen darf.

## Vorteile dieses Ansatzes

Variablenbibliotheken mit Wertemengen bieten mehrere praktische Vorteile:

- **Zentrale Konfiguration:** Werte werden an einer Stelle gepflegt, statt in mehreren Aktivitäten wiederholt zu werden.
- **Trennung der Umgebungen:** Entwicklungs- und Produktionswerte können dieselben Namen und Datentypen verwenden, aber unterschiedliche Werte enthalten.
- **Stabilere Bereitstellungen:** Die Pipeline-Definition bleibt unverändert, während die umgebungsspezifische Konfiguration separat ausgewählt wird.
- **Bessere Nachvollziehbarkeit:** Der Hinweis zur Auswirkungsanalyse macht den Umfang einer Änderung vor ihrer Bestätigung sichtbar.

Die Aktivierung einer Wertemenge bleibt dennoch eine gemeinsam genutzte Änderung. Verwenden Sie eine klare Namenskonvention, dokumentieren Sie die Werte und prüfen Sie die aktive Wertemenge vor einer Produktionsausführung.

## Zusammenfassung

Variablenbibliotheken trennen die Logik einer Fabric-Pipeline von umgebungsspezifischen Werten. In diesem Beispiel haben wir `vl_my_values` erstellt, Standardvariablen definiert, eine `PROD`-Wertemenge hinzugefügt und die gewünschte Wertemenge aktiviert. Dieses Muster eignet sich auch für Pfade, IDs, Verbindungsparameter und andere Werte, die sich zwischen Umgebungen unterscheiden.

## Referenz

- [Übersicht über Variablenbibliotheken](https://learn.microsoft.com/en-us/fabric/cicd/variable-library/variable-library-overview) — Microsoft Learn
