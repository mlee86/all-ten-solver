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

  const output = document.getElementById('output');
  output.textContent = 'Solving...\n';

  const results = solveAllTen(digits);

  for (let i = 1; i <= 10; i++) {
    output.textContent += `${i}:\n`;
    if (results[i].length === 0) {
      output.textContent += `  (no solutions)\n`;
    } else {
      for (const expr of results[i]) {
        output.textContent += `  ${expr}\n`;
      }
    }
  }
}

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

function evaluate(expr) {
  try {
    const val = eval(expr);
    if (typeof val === 'number' && isFinite(val)) {
      return Math.round(val * 1e6) / 1e6; // fix float rounding
    }
  } catch (e) {}
  return null;
}
