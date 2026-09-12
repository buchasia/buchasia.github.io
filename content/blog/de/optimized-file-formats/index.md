---
title: Optimierte Dateiformate
date: "2025-03-31T20:17:03.284Z"
description: "Dateiformate wie Avro, Optimized Row Columnar (ORC) und Parquet"
tags: [daten, datenbanken]
---

Es gibt viele Dateiformate, die so konzipiert sind, dass sie für Menschen lesbar sind. Diese Formate sind für die Speicherung oder Verarbeitung großer Datenmengen nicht optimal. JavaScript Object Notation (JSON) und Extensible Markup Language (XML) sind Beispiele für menschenlesbare Dateiformate.

_Falls ihr diese Dateiformate nicht kennt, habe ich einige Beispiele [am Ende](#examples) hinzugefügt – schaut sie euch an, bevor ihr weiterlest._

Schauen wir uns einige andere Formate an, die auf die eine oder andere Weise für sehr große Datenmengen und deren effizienten Zugriff optimiert sind.

## Avro-Format
Avro wurde 2009 vom Apache-Hadoop-Projekt entwickelt. Es wurde als Framework zur Datenserialisierung eingeführt, um den Bedarf an einem kompakten, schnellen und __schemabasierten__ Format in Big-Data-Ökosystemen zu decken, insbesondere für Systeme wie Apache Hadoop und Apache Kafka.

> Ein schemabasiertes Format verwendet eine vordefinierte Struktur, um die Organisation, Typen und Beziehungen der Datenfelder festzulegen.

### Beispielschema
```json
{
  "type": "record",
  "name": "Person",
  "fields": [
    {"name": "name", "type": "string"},
    {"name": "age", "type": "int"},
    {"name": "city", "type": "string"}
  ]
}
```
Das obige Schema definiert einen Person-Datensatz mit drei Feldern: name, age und city. Zusätzlich sehen wir, dass name und city vom Typ string sind und age vom Typ integer.

Avro ist ein __zeilenbasiertes__ Format.
> Ein zeilenbasiertes Format speichert jeden Datensatz (bzw. jede Zeile) zusammenhängend, anstatt in einem spaltenbasierten Format.
Eine Avro-Datei besteht aus zwei Teilen:
1. Dateiheader: Dieser enthält Metadaten und eine "Magic String", um die Datei als Avro-Datei zu identifizieren. Er enthält auch Informationen über das für die Datenserialisierung verwendete Schema. Schließlich enthält er einen zufällig generierten, 16 Byte langen Sync-Marker für die Datei.
2. Datenblöcke: Serialisierte Daten in kompaktem Binärformat.

Da wir jede Zeile zusammenhängend speichern, eignet sich Avro gut für Anwendungsfälle, bei denen ganze Datensätze auf einmal aufgerufen und verarbeitet werden müssen.

Da die Daten in einem kompakten Binärformat gespeichert werden, reduziert dies den Speicherplatzbedarf im Vergleich zu reinen Textformaten wie JSON und CSV. Das kompakte Format ist zudem für schnellen Datenzugriff optimiert. Avro unterstützt Schema-Evolution. Solange neue Schemata mit den alten kompatibel sind, können Daten mit dem neuen Schema gelesen werden, selbst wenn sie mit einer älteren Version geschrieben wurden.

Avro eignet sich nicht für analytische Abfragen, bei denen nur bestimmte Spalten gelesen werden müssen. Daher ist es bei komplexen Aggregationen langsamer.

## ORC-Format
Das __Optimized Row Columnar (ORC)__-Format ist, wie der Name schon sagt, ein hocheffizientes spaltenorientiertes Speicherformat, das von HortonWorks für den Einsatz in Apache Hive entwickelt wurde.

Im Gegensatz zu traditionellen zeilenbasierten Formaten wie CSV oder JSON speichert ORC Daten spaltenorientiert, das heißt, alle Werte einer bestimmten Spalte werden zusammen gespeichert. Es besteht aus:
- Stripes: Die Daten werden in große Blöcke, sogenannte Stripes, unterteilt, die Daten für eine oder mehrere Spalten enthalten.
- Row Indexes: Zusätzlich enthalten sie Metadaten über die Position der Zeilen für einen schnelleren Zugriff.
- Kompression: Integrierte Unterstützung für Kompression, wodurch die Speichergröße reduziert wird.
- Statistiken über die Daten: Enthält Minimum, Maximum, Summe und andere Aggregationen.

Einer der Vorteile von ORC ist, dass es die I/O-Operationen reduziert, da nur benötigte Spalten gelesen werden, was es ideal für Big-Data-Analyseworkloads macht. Ein weiterer Vorteil ist die hohe Kompressionsrate der ORC-Dateien aus Speicherperspektive.

ORC eignet sich nicht für transaktionale Workloads, die häufige Einfüge- und Aktualisierungsvorgänge erfordern, da das spaltenbasierte Format für leselastige Operationen optimiert ist.

## Parquet
__Parquet__ ist ein weiteres spaltenbasiertes Datenformat, das von Apache in Zusammenarbeit mit X (ehemals Twitter) und Cloudera entwickelt wurde. Ähnlich wie ORC und im Gegensatz zu zeilenbasierten Formaten wie CSV oder JSON speichert Parquet Daten spaltenweise, was die Lesegeschwindigkeit und Kompressionseffizienz erheblich verbessert.

Parquet organisiert Daten in Row Groups, und innerhalb jeder Row Group werden die Daten in einem spaltenorientierten Layout gespeichert. Jede Spalte wird weiter in Datenseiten unterteilt, die die tatsächlichen Werte zusammen mit Metadaten wie Minimum, Maximum und Anzahl-Statistiken enthalten.

Eine Parquet-Datei enthält Metadaten darüber, welche Zeilen in jedem Chunk enthalten sind, sodass der Zugriff auf bestimmte Spalten dieser Zeilen effizient erfolgen kann.

Einer der wichtigsten Vorteile von Parquet ist seine Effizienz bei analytischen Workloads. Da die Daten in einem spaltenbasierten Format gespeichert werden, laufen Aggregationen und Filteroperationen wesentlich schneller ab als bei zeilenbasierten Formaten. Parquet bietet außerdem Schema-Evolution, sodass Nutzer das Datenschema im Laufe der Zeit ändern können, ohne die Kompatibilität zu brechen.

Parquet hat ähnliche Einschränkungen wie alle spaltenbasierten Formate: Es eignet sich nicht besonders gut für transaktionale Workloads, die häufige Einfüge-, Aktualisierungs- oder Löschvorgänge erfordern.
<a id="examples"></a>
## JSON-Beispiel

### Einfaches Beispiel
```json
{
    "name": "John Doe",
    "age": 30,
    "city": "Frankfurt"
}
```
Hier sehen wir ein JSON-Objekt über eine Person. Das JSON-Objekt für eine Person enthält Informationen über Name, Alter und Wohnort einer Person.

### Verschachteltes Beispiel
```json
{
  "person": {
    "name": "Jane Smith",
    "age": 25,
    "address": {
      "street": "Kaiserstraße 123",
      "city": "Munich",
      "country": "Germany"
    }
  }
}
```
Dieses Beispiel enthält zusätzlich ein Address-Objekt, das im Person-Objekt verschachtelt ist.

## XML-Beispiel
Schauen wir uns das obige verschachtelte Beispiel im XML-Format an:

```xml
<person>
  <name>Jane Smith</name>
  <age>25</age>
  <address>
    <street>Kaiserstraße 123</street>
    <city>Munich</city>
    <country>Germany</country>
  </address>
</person>
```
Wie ihr bereits erkennen könnt, benötigen die beiden Formate deutlich mehr Speicherplatz, da JSON-Objekte immer vorhandene Schlüssel besitzen und XML öffnende und schließende Tags benötigt, die noch mehr Platz beanspruchen. Obwohl sie also menschenlesbar sind, sind sie keine effizienten Möglichkeiten, große Datenmengen zu speichern.

### Referenzen
1. [JSON auf Wikipedia](https://en.wikipedia.org/wiki/JSON)
2. [XML auf Wikipedia](https://en.wikipedia.org/wiki/XML)
3. [Apache Avro auf Wikipedia](https://en.wikipedia.org/wiki/Apache_Avro)
4. [Erklärung der Dateiformate](https://www.upsolver.com/blog/the-file-format-fundamentals-of-big-data)
