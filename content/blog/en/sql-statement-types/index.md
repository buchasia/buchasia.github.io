---
title: SQL statement types
date: "2025-04-03T15:13:03.284Z"
description: "SQL statements are categorized into three main types: DDL (Data Definition Language), DCL (Data Control Language), and DML (Data Manipulation Language)."
tags: [databases, sql]
---

SQL stands for _Structured Query Language_ and can be used to communicate with a relational database. Almost every backend developer should have had contact with one or other form of SQL depening on the underlying database system.

## SQL Statement types

SQL statements can be grouped into three main groups:

- __Data Definition Language (DDL)__ - We can use DDL statements to interact with the database in order to create, modify, and delete tables and other database objects from the database. Some of the common DDL statements are: 


| Statement   | Usage |
|-----------|-------|
| CREATE    | To create a new database object, like a table, view or stored procedure |
| ALTER    | To modify an existing database object, for example changing type of a column of a table |
| RENAME    | To rename an existing database object |
| DROP    | To drop/delete an existing database object |

**Table 1:** Common DDL Statements

<details>
<summary>Example Create Statement</summary>

```sql
CREATE TABLE Person
(
    ID INT PRIMARY KEY,
    Name VARCHAR(40) NOT NULL,
    Age DECIMAL NULL,
    Country VARCHAR(128) NOT NULL,
);
```
_The datatypes that are avialable for columns may differ from one database system to another._
</details>

- __Data Control Language (DCL)__ - We can use DCL statements to manage access to objects in a database. Some of the common DCL statements are: 


| Statement   | Usage |
|-------------|-------|
| GRANT    | To grant permission to a database object to perform a specific action or actions |
| DENY    | To deny permission to a database object to perform a specific action or actions |
| REVOKE    | To revoke a previously granted permission |

**Table 1:** Common DCL Statements

<details>
<summary>Example Grant Statement</summary>

```sql
GRANT SELECT, INSERT
ON Person
TO user1;
```
</details>

- __Data Manipulation Language (DML)__ - We can use DML statements to manipulate the rows of data in the tables. They enable us to create new rows, retrieve, modify or delete existing rows as well. These are also the most commonly used statements. Some of the common DML statements are: 


| Statement   | Usage |
|-----------|-------|
| INSERT    | To create a new row in a table |
| SELECT    | To read rows from a table |
| DELETE    | To delete existing rows from a table  |
| UPDATE    | To modfiy existing rows in a table |

**Table 1:** Common DML Statements

<details>
<summary>Example Select Statement</summary>

```sql
SELECT *
FROM Person
WHERE Name = 'Example';
```
</details>