---
title: Befreundete Zahlenpaare
date: "2025-03-30T15:13:03.284Z"
description: "Befreundete Zahlen sind zwei Zahlen, bei denen die Summe der echten Teiler jeder Zahl gleich der jeweils anderen Zahl ist – eine faszinierende Symmetrie in der Zahlentheorie."
tags: [mathematik, zahlentheorie]
---

Ich war schon immer fasziniert von Zahlen, ihren Eigenschaften und wie sie miteinander in Beziehung stehen. Während meiner Studienzeit habe ich Hunderte von Stunden damit verbracht, über verschiedene Eigenschaften von Zahlen zu lesen, Algorithmen zu implementieren, um diese Zahlen selbst zu finden, und diese Algorithmen zu optimieren, um schneller zu werden, je größer die Zahlen mit mehr Stellen wurden.

Eine solche besondere Gruppe von Zahlen sind befreundete Zahlen (Amicable Numbers). Befreundete Zahlen sind zwei verschiedene Zahlen, die so miteinander in Beziehung stehen, dass die Summe der echten Teiler der einen Zahl gleich der anderen Zahl ist.

Lasst uns zunächst einige Definitionen für ein besseres Verständnis geben:

Für jede natürliche Zahl $n \in \mathbb{N}$ ist die Teilersumme $\sigma(n)$ gegeben durch
$$
\sigma(n) = \sum_{d | n } d
$$

Hierbei ist $d$ jede Zahl, die $n$ ohne Rest teilt. Nehmen wir ein Beispiel für $n = 6$: Wir erhalten $\sigma(6) = 1 + 2 + 3 + 6 = 12$.

Die Summe der echten Teiler ist gegeben als
$$
s(n) = \sum_{d | n \wedge d < n} d = \sigma(n) - n
$$

Mit dem vorherigen Beispiel für $n=6$ erhalten wir
$$
s(6) = 1 + 2 + 3 = 6 = \sigma(6) - 6
$$

Eine schöne Eigenschaft von Primzahlen ist, dass $\sigma(p) = p + 1$ gilt.

Nachdem wir nun wissen, wie man die Summe der echten Teiler berechnet, können wir definieren, wann zwei Zahlen ein befreundetes Zahlenpaar bilden.

Seien $a \in \mathbb{N}$ und $b \in \mathbb{N}$, dann heißen $a$ und $b$ befreundete Zahlen `genau dann`, wenn Folgendes gilt:

$$
s(a) = b \text{ und } s(b) = a.
$$

Mit anderen Worten können wir schreiben:

$$
\sigma(a) = \sigma(b) = a + b
$$

Das kleinste befreundete Zahlenpaar ist `(220, 284)`, bekannt seit 1860. Eine Datenbank bekannter befreundeter Zahlenpaare findet ihr unter [2 in den Referenzen](#database).

Es gibt viele offene Fragen zu befreundeten Zahlen:
- Gibt es unendlich viele befreundete Zahlenpaare?
- Gibt es eine effiziente Methode, um solche Zahlen zu identifizieren?

Falls es euch noch nicht aufgefallen ist: Die Berechnung von $s(n)$ oder $\sigma(n)$ erfordert sehr viel Rechenleistung, wenn wir größere befreundete Zahlenpaare finden wollen. Das liegt daran, dass wir die Primfaktorzerlegung der Zahlen bestimmen müssten.

Jede Zahl $a$ lässt sich als Produkt von Primzahlen darstellen. Nehmen wir ein weiteres Beispiel mit $n = 12$. Wir können diese Zahl als $n = 2^2 \times 3$ darstellen.

Mit anderen Worten: Nehmen wir alle Primzahlen in einer Menge $P$, sodass $p_i \in P$ genau dann, wenn $p_i | n$ gilt, und $j_i = \argmax_k \left( p_i ^k | n \right)$, also ist $j_i$ die maximale Potenz der Primzahl $p_i$, die $n$ noch ohne Rest teilt. Dann können wir $n$ wie folgt schreiben:
$$
n = \prod_{p_i \in P} p_i^{j_i}
$$

Dann können wir Folgendes schreiben:
$$
\sigma(n) = \prod_{p_i \in P} \frac{p_i^{j_i + 1} - 1}{p_i - 1}
$$

Schauen wir uns ein Beispiel an:
$$
\sigma(3 \times 5 \times 7) = 1 + 3 + 5 + 7 + 15 + 21 + 35 + 105 = 192
$$
und wir sehen, dass
$$
\sigma(3 \times 5 \times 7) = \frac{3^2 - 1}{3 - 1}\cdot \frac{5^2 - 1}{5 - 1}\cdot \frac{7^2 - 1}{7 - 1} = 4 \times 6 \times 8 = 192
$$

Ich habe ein Paper, das ich eines Tages fertigstellen sollte und das einige oben nicht genannte Eigenschaften befreundeter Zahlen beschreibt, mit denen man sie mit derzeit ungenutzten Methoden finden könnte. Hoffentlich bald!

### Referenzen
1. [Befreundete Zahlen auf Wikipedia](https://en.wikipedia.org/wiki/Amicable_numbers)
2. [Datenbank befreundeter Zahlenpaare](https://sech.me/ap/) <a id="database"></a>
