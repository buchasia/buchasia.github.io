---
title: Amicable Pairs
date: "2025-03-30T15:13:03.284Z"
description: "Amicable numbers are two numbers where the sum of the proper divisors of each equals the other, revealing a fascinating symmetry in number theory."
tags: [mathematics, number theory]
---

I have always been fascinated by numbers and their properties and how they are related to one another. During my student life I have spent hundreds of hours reading about different properties of numbers, implementing algorithms to find these numbers for myself and optimizing these algorithms to be faster as I moved to bigger numbers with more digits.

One such special group of numbers is Amicable numbers. Amicable numbers are two different numbers related in such a way that the sum of their proper divisors is equal to the other number.

Let us give some definitions for better understanding later on:

For any natural number $n \in \mathbb{N}$ the sum of divisors $\sigma(n)$ is given as
$$
\sigma(n) = \sum_{d | n } d
$$ 

Here $d$ is all the numbers that properly divide $n$. Let us take an example for $n = 6$, we have $\sigma(6) = 1 + 2 + 3 + 6 = 12$.

Sum of proper divisors is given as
$$
s(n) = \sum_{d | n \wedge d < n} d = \sigma(n) - n
$$

Working with the previous example of $n=6$, we get 
$$
s(6) = 1 + 2 + 3 = 6 = \sigma(6) - 6
$$

One nice thing about prime numbers is that $\sigma(p) = p + 1$. 

Now that we know, how to compute sum of proper divisors, we can define when two numbers are amicable pairs. 

Let $a \in \mathbb{N}$ and $b \in \mathbb{N}$, then $a$ and $b$ are called amicable pairs `if and only if`, the following is true:

$$
s(a) = b \text{ and } s(b) = a.
$$

In other words we can write:

$$
\sigma(a) = \sigma(b) = a + b
$$

The smallest amicable pairs are `(220, 284)` known to us since 1860. There is a database of known amicable pairs at [2 in Reference](#database).

There are many open questions about amicable pairs:
- Are there infinitely many amicable pairs?
- Is there an efficient implementation to identify such numbers?

If you might have not noticed, computation of $s(n)$ or $\sigma(n)$ requires a lot of computation power if we want to find bigger amicable pairs. This is because we would need to identify the prime factorization of the numbers. 

Any number $a$ can be represented as a product of the prime numbers. Let us take another example of $n = 12$. We can represent this number as $n = 2^2 \times 3$. 

In other words let us take all prime numbers in a set $P$ such that $p_i \in P$, if and only if $p_i | n$ and $j_i = \argmax_k \left( p_i ^k | n \right)$, so $j_i$ is the maximum power of the prime $p_i$ that still divides $n$ without any remainders. Then we can write $n$ as following:
$$
n = \prod_{p_i \in P} p_i^{j_i}
$$

Then we can write following:
$$
\sigma(n) = \prod_{p_i \in P} \frac{p_i^{j_i + 1} - 1}{p_i - 1}
$$

Let us have a look at an example:
$$
\sigma(3 \times 5 \times 7) = 1 + 3 + 5 + 7 + 15 + 21 + 35 + 105 = 192
$$
and we see that
$$
\sigma(3 \times 5 \times 7) = \frac{3^2 - 1}{3 - 1}\cdot \frac{5^2 - 1}{5 - 1}\cdot \frac{7^2 - 1}{7 - 1} = 4 \times 6 \times 8 = 192
$$

I have a paper, that I should some day finish which gives some properties of amicable numbers not mentioned above which can then be used to find them using methods not being used at the moment. Hopefully soon!

### References
1. [Amicable numbers on Wikipedia](https://en.wikipedia.org/wiki/Amicable_numbers)
2. [Database of Amicable Pairs](https://sech.me/ap/) <a id="database"></a>
