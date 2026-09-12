---
title: The ACID Principle
date: "2025-04-01T15:13:03.284Z"
description: "ACID ensures database transactions are Atomic (all or nothing), Consistent (valid state maintained), Isolated (independent execution), and Durable (permanent after commit)."
tags: [databases, transactions]
---

Almost everyone of us uses database systems in one way or other. The database systems could be part of the apps that we have on our phone or websites that we use through our browsers. 

Let us look at an example which is easy to follow for all of us. For example, we transfer someone money from our account to another account. Now, imagine if there is a problem during the processing and the money gets debited from our account but does not get credited to the other account. This would be really problematic for everyone involved even for the bank to correct such failures. 

So, how do we make sure that such situations do not happen very often instead of all the possible problems that could take place? This is made sure because the database transactions follow the properties which are combined called as **A**tomicity, **C**onsistency, **I**solation and **D**urability in short _ACID_.

> A database transaction is a sequence of operations performed as a single, atomic unit of work that follows the ACID properties.

Let us look at these properties and what they mean one by one:

- __Atomicity__: A database transaction consists of multiple changes to one or more tables. For example, in case of transfer of money, they have to do validations before, they deduct the money from my account and then add it to the other person's account, so there are more than one changes that needs to be applied. 
  
  Atomicity guarantees that each transaction is treated as a single unit. So either all the changes are successful or none of them is applied. So, in case of failure the database remains unchanged. So, no partial updates are possible.

- __Consistency__: This property makes sure that a transaction can only bring the database from one valid state to another valid state. While doing so all the rules are maintained (e.g. constraints, triggers). In our example, this would mean that at the end, the correct amount of money was debited from my account and the same amount was credited to the another person's account. Furthermore, if a rule does not allow for account balances to be negative then the transfer should fail and no money should be exchanged.

- __Isolation__: Let us consider another example, where two users want to book the last ticket for a flight. In this case only one should succeed preventing double booking. This is what isloation property makes sure.

  Transactions must execute independently without interference, ensuring concurrent transactions don’t cause inconsistencies.

- __Durability__: Once a transaction is committed, it remains so, even in the event of a system failure. So, in case of our example, once the transfer has taken palce and the changes are committed to the database, this cannot be lost when the system crashes and a restore is made.

> A commit saves all changes made in a transaction permanently to the database.

ACID makes databases robust, reliable, and trustworthy, preventing data corruption and inconsistencies. Whether you're a developer, data engineer, or tech enthusiast, understanding ACID is crucial for building scalable and fail-proof systems.

### References
1. [ACID on Wikipedia](https://en.wikipedia.org/wiki/ACID)
