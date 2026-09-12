---
title: Circulant Matrices - Part I
date: "2025-03-29T13:32:03.284Z"
description: "What are circulant matrices and their relevance in geometric deep learning."
---

Recently, I attended a lecture on geometric deep learning. The lecture was really amazing. Came to learn about a completely different perspective about methods that I already knew, like CNNs, Transformers. In this lecture I came across the concept of `circulant matrices`. 


`Circulant Matrix` is a special matrix where each row is a cyclic shift of the previous row. In mathematical terms, a circulant matrix $C$ of size $n \times n $ is a square matrix where each row is obtained by shifting the previous row one position to the right (or left) in a circular manner. It can be written as:

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

where the elements from the first row $c_0, c_1, \cdots c_{n-1}$ determine the entire matrix.

## Properties
- An important property of circulant matrices is that the product of two circulant matrices is again a circulant matrix. For example:
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

- Two circulant matrices commute:
$$
C_1 C_2 = C_2 C_1
$$

For other properties have a look at [1 and 2 in References](#references).

## Shift operator as a circulant matrix
We can represent a shift operator as a matrix multiplication with a circulant matrix. So if we want to shift the columns of a matrix to the right by one we can use a circulant matrix to do it. For example:
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

If we put the circulant matrix on the right during the matrix multiplication, we can produce a shift in terms of the rows. 

Now, it is easy to see that we can actually create any permuation of the matrix rows or columns depending on how we place the $1$ entries in the rows of the matrix. 

Let us denote the above matrix by $S$ (right shift):
$$
S = \begin{bmatrix}
0 & 1 & 0 & 0  \\
0 & 0 & 1 & 0  \\
0 & 0 & 0 & 1  \\ 
1 & 0 & 0 & 0 
\end{bmatrix}
$$

Applying the $S$ matrix multiple $k$-times will shift the original matrix to the right by $k$:
$$
S^2 = \begin{bmatrix}
0 & 0 & 1 & 0  \\
0 & 0 & 0 & 1  \\
1 & 0 & 0 & 0  \\ 
0 & 1 & 0 & 0 
\end{bmatrix}
$$

- Inverse of a shift operator is its transpose, i.e. $S^{-1} = S^\top$.
- Shift operator are orthogonal, i.e. $S^\top S = I$

Using the shift operation as above we can move an image for example to the left or right or up and down using matrix multiplications.

## Circular convolution as multiplication by circulant matrices
Let us look at multiplication of a circulant matrix $C$ with a vector $x$:
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

If we now see how the individual elements of $y$ are computed:
$$
y_0 = c_0 x_0 + c_1 x_1 + c_2 x_2 + \cdots + c_{n-1} x_{n-1} 
$$
$$
y_1 = c_{n-1} x_0 + c_0 x_1 + c_1 x_2 + \cdots + c_{n-2} x_{n-1} 
$$

and so on.

This can be rewritten as
$$
y_k = \sum_{i=0}^n c_{i-k}x_i
$$

Here the subscripts can be considered to be circular so $c_{-1} = c_{n-1}$ and so on. Then the above sum represents a circular convolution. In this way we see that a convolution operation can be represented as multiplcation with a circulant matrix. This can be easily extended to two dimensions, then we have the concept of block circulant matrices.

More to follow in the next Post :)

### References
1. [Circulant Matrix on Wikipedia](https://en.wikipedia.org/wiki/Circulant_matrix)
2. [MIT Spring17 Notes on Circulant Matrices](https://web.mit.edu/18.06/www/Spring17/Circulant-Matrices.pdf)
