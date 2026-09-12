---
title: Zirkulante Matrizen - Teil I
date: "2025-03-29T13:32:03.284Z"
description: "Was zirkulante Matrizen sind und welche Bedeutung sie im geometrischen Deep Learning haben."
tags: [mathematik, maschinelles lernen]
---

Kürzlich habe ich an einer Vorlesung über geometrisches Deep Learning teilgenommen. Die Vorlesung war wirklich beeindruckend. Ich habe eine völlig neue Perspektive auf Methoden kennengelernt, die ich bereits kannte, wie CNNs und Transformer. In dieser Vorlesung bin ich auf das Konzept der `zirkulanten Matrizen` gestoßen.

Eine `zirkulante Matrix` ist eine spezielle Matrix, bei der jede Zeile eine zyklische Verschiebung der vorherigen Zeile ist. Mathematisch ausgedrückt ist eine zirkulante Matrix $C$ der Größe $n \times n$ eine quadratische Matrix, bei der jede Zeile durch zirkuläres Verschieben der vorherigen Zeile um eine Position nach rechts (oder links) entsteht. Sie lässt sich schreiben als:

$$
C =
\begin{bmatrix}
c_0 & c_1 & c_2 & \cdots & c_{n-1} \\
c_{n-1} & c_0 & c_1 & \cdots & c_{n-2} \\
c_{n-2} & c_{n-1} & c_0 & \cdots & c_{n-3} \\
\vdots & \vdots & \vdots & \ddots & \vdots \\
c_1 & c_2 & c_3 & \cdots & c_0
\end{bmatrix}
$$

wobei die Elemente der ersten Zeile $c_0, c_1, \cdots c_{n-1}$ die gesamte Matrix bestimmen.

## Eigenschaften
- Eine wichtige Eigenschaft zirkulanter Matrizen ist, dass das Produkt zweier zirkulanter Matrizen wieder eine zirkulante Matrix ist. Zum Beispiel:
$$
\begin{bmatrix}
1 & 2 & 0 & 0 & 1 \\
1 & 1 & 2 & 0 & 0 \\
0 & 1 & 1 & 2 & 0 \\
0 & 0 & 1 & 1 & 2 \\
2 & 0 & 0 & 1 & 1
\end{bmatrix} 
\cdot
\begin{bmatrix}
-1 & 0 & 0 & 0 & 1 \\
1 & -1 & 0 & 0 & 0 \\
0 & 1 & -1 & 0 & 0 \\
0 & 0 & 1 & -1 & 0 \\
0 & 0 & 0 & 1 & -1
\end{bmatrix} 
$$

$$
=
\begin{bmatrix} 1 & -2 & 0 & 1 & 0 \\ 0 & 1 & -2 & 0 & 1 \\ 1 & 0 & 1 & -2 & 0 \\ 0 & 1 & 0 & 1 & -2 \\ -2 & 0 & 1 & 0 & 1 \end{bmatrix}
$$

- Zwei zirkulante Matrizen kommutieren:
$$
C_1 C_2 = C_2 C_1
$$

Weitere Eigenschaften findet ihr in [1 und 2 in den Referenzen](#references).

## Der Shift-Operator als zirkulante Matrix
Wir können einen Shift-Operator als Matrixmultiplikation mit einer zirkulanten Matrix darstellen. Wenn wir also die Spalten einer Matrix um eins nach rechts verschieben möchten, können wir dazu eine zirkulante Matrix verwenden. Zum Beispiel:
$$
\begin{bmatrix}
1 & 2 & 3 & 4  \\
5 & 6 & 7 & 8  \\
9 & 10 & 11 & 12  \\ 
13 & 14 & 15 & 16 
\end{bmatrix} 
\cdot
\begin{bmatrix}
0 & 1 & 0 & 0  \\
0 & 0 & 1 & 0  \\
0 & 0 & 0 & 1  \\ 
1 & 0 & 0 & 0 
\end{bmatrix}
= \begin{bmatrix}
4 & 1 & 2 & 3  \\
8 & 5 & 6 & 7  \\
12 & 9 & 10 & 11  \\ 
16 & 13 & 14 & 15 
\end{bmatrix} 
$$

Wenn wir die zirkulante Matrix bei der Matrixmultiplikation rechts platzieren, erzeugen wir stattdessen eine Verschiebung der Zeilen.

Nun ist leicht zu erkennen, dass wir tatsächlich jede beliebige Permutation der Matrixzeilen oder -spalten erzeugen können, je nachdem, wie wir die Einsen in den Zeilen der Matrix platzieren.

Bezeichnen wir die obige Matrix mit $S$ (Rechtsverschiebung):
$$
S = \begin{bmatrix}
0 & 1 & 0 & 0  \\
0 & 0 & 1 & 0  \\
0 & 0 & 0 & 1  \\ 
1 & 0 & 0 & 0 
\end{bmatrix}
$$

Wendet man die Matrix $S$ mehrmals ($k$-mal) an, verschiebt sich die ursprüngliche Matrix um $k$ nach rechts:
$$
S^2 = \begin{bmatrix}
0 & 0 & 1 & 0  \\
0 & 0 & 0 & 1  \\
1 & 0 & 0 & 0  \\ 
0 & 1 & 0 & 0 
\end{bmatrix}
$$

- Die Inverse eines Shift-Operators ist seine Transponierte, d. h. $S^{-1} = S^\top$.
- Shift-Operatoren sind orthogonal, d. h. $S^\top S = I$

Mit der oben beschriebenen Shift-Operation können wir beispielsweise ein Bild mittels Matrixmultiplikation nach links oder rechts oder nach oben oder unten verschieben.

## Zirkuläre Faltung als Multiplikation mit zirkulanten Matrizen
Schauen wir uns die Multiplikation einer zirkulanten Matrix $C$ mit einem Vektor $x$ an:
$$
y = C \cdot x = \begin{bmatrix}
c_0 & c_1 & c_2 & \cdots & c_{n-1} \\
c_{n-1} & c_0 & c_1 & \cdots & c_{n-2} \\
c_{n-2} & c_{n-1} & c_0 & \cdots & c_{n-3} \\
\vdots & \vdots & \vdots & \ddots & \vdots \\
c_1 & c_2 & c_3 & \cdots & c_0
\end{bmatrix} \cdot 
\begin{bmatrix}
x_0  \\
x_1 \\
x_2 \\
\vdots \\
x_{n-1}
\end{bmatrix}
$$

Betrachten wir nun, wie die einzelnen Elemente von $y$ berechnet werden:
$$
y_0 = c_0 x_0 + c_1 x_1 + c_2 x_2 + \cdots + c_{n-1} x_{n-1} 
$$
$$
y_1 = c_{n-1} x_0 + c_0 x_1 + c_1 x_2 + \cdots + c_{n-2} x_{n-1} 
$$

und so weiter.

Dies kann umgeschrieben werden als
$$
y_k = \sum_{i=0}^n c_{i-k}x_i
$$

Die Indizes können hier als zirkulär betrachtet werden, sodass $c_{-1} = c_{n-1}$ und so weiter gilt. Die obige Summe stellt dann eine zirkuläre Faltung dar. Auf diese Weise sehen wir, dass eine Faltungsoperation als Multiplikation mit einer zirkulanten Matrix dargestellt werden kann. Dies lässt sich leicht auf zwei Dimensionen erweitern, wodurch wir das Konzept der Block-zirkulanten Matrizen erhalten.

Mehr dazu im nächsten Beitrag :)

### Referenzen
1. [Zirkulante Matrix auf Wikipedia](https://en.wikipedia.org/wiki/Circulant_matrix)
2. [MIT Spring17 Notes zu zirkulanten Matrizen](https://web.mit.edu/18.06/www/Spring17/Circulant-Matrices.pdf)
