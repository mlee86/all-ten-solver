/**
 * Main solve function triggered by the "Solve" button.
 * Reads user input, validates it, runs solver, and updates the UI with results.
 */
function solve() {
  const digits = [
    +document.getElementById('digit1').value,
    +document.getElementById('digit2').value,
    +document.getElementById('digit3').value,
    +document.getElementById('digit4').value,
  ];

  if (digits.some(d => d < 1 || d > 9 || isNaN(d))) {
    alert('Please enter four digits from 1 to 9.');
    return;
  }

  const results = solveAllTen(digits);
  const output = document.getElementById('output');
  output.innerHTML = '';

  // Create collapsible headers for values 1–10
  for (let i = 1; i <= 10; i++) {
    const detail = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = `${i} (${results[i].length} solution${results[i].length !== 1 ? 's' : ''})`;
    detail.appendChild(summary);

    const list = document.createElement('ul');
    for (const expr of results[i]) {
      const item = document.createElement('li');
      item.textContent = expr;
      list.appendChild(item);
    }

    if (results[i].length === 0) {
      const item = document.createElement('li');
      item.textContent = '(no solutions)';
      list.appendChild(item);
    }

    detail.appendChild(list);
    output.appendChild(detail);
  }
}

/**
 * Solves for all values from 1 to 10 using combinations of the given digits.
 * @param {number[]} digits - Array of 4 numbers between 1–9
 * @returns {Object} Map of values (1-10) to an array of solution expressions
 */
function solveAllTen(digits) {
  const results = {};
  for (let i = 1; i <= 10; i++) results[i] = [];

  const permutations = permute(digits.map(String));
  const seen = new Set();

  for (const perm of permutations) {
    const variants = concatVariants(perm);
    for (const variant of variants) {
      const exprs = generateExpressions(variant);
      for (const expr of exprs) {
        const value = evaluate(expr);
        if (value !== null && Number.isInteger(value) && value >= 1 && value <= 10) {
          const key = `${value}:${expr}`;
          if (!seen.has(key)) {
            seen.add(key);
            results[value].push(expr);
          }
        }
      }
    }
  }

  return results;
}

/**
 * Returns all permutations of the input array.
 * Used to try all digit orders (e.g., [2, 5, 2, 2] → all reorderings)
 */
function permute(arr) {
  const result = [];
  function helper(start) {
    if (start === arr.length) {
      result.push([...arr]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      [arr[start], arr[i]] = [arr[i], arr[start]];
      helper(start + 1);
      [arr[start], arr[i]] = [arr[i], arr[start]];
    }
  }
  helper(0);
  return result;
}

/**
 * Returns all ways to concatenate the digits in the given order.
 * Example: ['2','2','5','2'] →
 *   ['2','2','5','2'], ['2','2','52'], ['2','25','2'], ['22','5','2'], ['22','52'], etc.
 */
function concatVariants(digits) {
  const results = [];
  const n = digits.length;

  const helper = (index, current) => {
    if (index === n) {
      results.push(current);
      return;
    }
    let str = '';
    for (let i = index; i < n; i++) {
      str += digits[i];
      helper(i + 1, [...current, str]);
    }
  };

  helper(0, []);
  return results;
}

/**
 * Recursively generates all valid expressions using arithmetic operators.
 * Input: ['22', '5'] → Output: ['(22+5)', '(22-5)', '(22*5)', '(22/5)']
 */
function generateExpressions(nums) {
  if (nums.length === 1) return [nums[0]];

  const results = [];

  for (let i = 1; i < nums.length; i++) {
    const left = nums.slice(0, i);
    const right = nums.slice(i);

    const leftExprs = generateExpressions(left);
    const rightExprs = generateExpressions(right);

    for (const l of leftExprs) {
      for (const r of rightExprs) {
        for (const op of ['+', '-', '*', '/']) {
          results.push(`(${l}${op}${r})`);
        }
      }
    }
  }

  return results;
}

/**
 * Safely evaluates a math expression string using JavaScript's eval.
 * Rounds to 6 decimal places to handle float quirks.
 */
function evaluate(expr) {
  try {
    const val = eval(expr);
    if (typeof val === 'number' && isFinite(val)) {
      return Math.round(val * 1e6) / 1e6;
    }
  } catch (e) {}
  return null;
}
