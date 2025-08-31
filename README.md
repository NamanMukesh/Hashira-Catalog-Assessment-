# Secret Sharing Polynomial Solver

A Node.js implementation of Shamir's Secret Sharing scheme that recovers secrets from polynomial roots using Lagrange interpolation.

## Installation

```bash
npm install big-integer
```

## Usage

```bash
node secret_solver.js
```

Enter your JSON filename when prompted (or press Enter for `testcase.json`).

## Input Format

```json
{
    "keys": {
        "n": 4,
        "k": 3
    },
    "1": {
        "base": "10",
        "value": "4"
    },
    "2": {
        "base": "2", 
        "value": "111"
    },
    "3": {
        "base": "10",
        "value": "12"
    }
}
```

- `n`: Total number of roots provided
- `k`: Minimum roots required to solve
- Each numbered key represents a point (x, y) where y is base-encoded

## How It Works

1. Reads JSON test case
2. Converts base-encoded y-values to decimal
3. Applies Lagrange interpolation using k points
4. Returns the secret constant c = f(0)

## Example

Input: Points (1,4), (2,7), (3,12)  
Output: Secret = 3
