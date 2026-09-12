---
title: Optimized file formats
date: "2025-03-31T20:17:03.284Z"
description: "File formats like Avro, Optimized Row Columnar (ORC) and Parquet"
---

We have many file formats that are desgined to be readable by human beings. These formats are not optimal for storage or processing of large amounts of data. JavaScript Object Notation (JSON) and Extensible Markup Language (XML) are examples of human readable file formats. 

_If you do not know about these file formats I have added some examples [at the end](#examples), do have a look at those before continuing._

Let us have a look at some other formats that are optimized in one way or other for very large amount of data and their efficient access.

## Avro format
Avro was created in 2009 by the Apache Hadoop project. It was introduced as a data serialization framework to address the need for a compact, fast, and __schema-based__ format in big data ecosystems, particularly for systems like Apache Hadoop and Apache Kafka.

>A schema-based format uses a predefined structure to define the organization, types, and relationships of the data fields.

### Example schema
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
The schema above defines Person record which has three fields, name, age and city. Additionally, we also see that name and city are of type string and age is integer.

Avro is a __row-based__ format.
> A row-based format is where each record (or row) is stored together, rather than in a columnar format. 
An Avro file consists of two parts:
1. File Header: This includes metadata and a magic string to identify the file as an Avro file. It also contains information about the Schema used for data serialization. Finally, it has a 16-byte, randomly generated sync marker for the file.
2. Data Blocks: Serialized data in compact binary format.

Since, we store each row together, Avro is well-suited for use cases where you need to access and process entire records at once.

Because the data is stored in compact binary format, this reduces the storage space compared to plain text formats like JSON and CSV. The compact format is also optimized for fast data access. Avro supports schema evolution. As long as new schemas are compatible with the old ones, data can be read with new schema even if it was written with an older version.

Avro is not suited for analytical queries where only specific columns need to be read. Therefore, it is slower for complex aggregations.

## ORC format
The __Optimized Row Columnar (ORC)__ format as the name suggests is highly efficient columnar storage format developed by HortonWorks for operations in Apache Hive. 

Unlike, traditional row-based formats like CSV, or JSON, ORC stores data in a column-oriented manner, meaning all values of a particular column are stored together. It consists of 
- Stripes: Data is divided into large blocks called stripes, which contain data for one or more columns. 
- Row indexes: Additionally, they have metadata about the position of rows for faster access.
- Compression: Built-in support for compression reducing storage size
- Statistics about the data: Includes min, max, sum and other aggregations.

One of the advantages of ORC is it reduces I/O operations since only required columns are read, making it ideal for big data analytics workloads. Another benefit is from the storage perspective, the ORC files are highly compressed.

ORC is not suited for transactional workloads which require frequent insert and updates, as the columnar format is optimized for read-heavy operations. 

## Parquet
__Parquet__ is another columnad data format developed by Apache in collaboration with X (formerly Twitter) and Cloudera. Similar to ORC and unlike row-based formats such as CSV or JSON, Parquet stores data column by column, which significantly improves read performance and compression efficiency.

Parquet organizes data into row groups, and within each row group, data is stored in a columnar layout. Each column is further divided into data pages, which contain actual values along with metadata like min, max, and count statistics.

A Parquet file includes metadata about which rows are included in each chunk, so that the access to specific columns of these rows can be efficient. 


One of the key advantages of Parquet is its efficiency in analytical workloads. Since data is stored in a columnar format, aggregations and filtering operations execute much faster compared to row-based formats. Parquet also provides schema evolution, allowing users to modify the data schema over time without breaking compatibility. 

Parquet has similar limitations as all columnar based formats, that they are not very well suited for transactional workloads that require frequent inserts, updates or deletes.
<a id="examples"></a>
## JSON Example

### Simple example
```json
{
    "name": "John Doe",
    "age": 30,
    "city": "Frankfurt"
}
```
Here we see a JSON Object about a Person. The JSON object for a Person includes information about name, age and city of a person. 

### Nested example
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
This example additionally has the addess object nested inside the person object.

## XML Example
Let us look at the nested example from above in XML format:

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
As you can already observe, the two formats need a lot of additional space as JSON objects have keys that are always present and in case of XML we have opening and closing tags that need even more space. So, although they are human readable they are not efficient ways of sotring large amounts of data. 

### References
1. [JSON on Wikipedia](https://en.wikipedia.org/wiki/JSON)
2. [XML on Wikipedia](https://en.wikipedia.org/wiki/XML)
3. [Apache Avro on Wikipedia](https://en.wikipedia.org/wiki/Apache_Avro)
4. [Explaination of the file formats](https://www.upsolver.com/blog/the-file-format-fundamentals-of-big-data)